<?
require_once('../Scripts/DWCF.php');
require_once('../Scripts/DSQL.php');
require_once('../../Config.php');
DWCF::CallByAction();

function Action_Submit()
{
	//Get the list of variables to check
	$AllVars=Array(
		'FirstName'=>null, 'LastName'=>null, 'PhoneNumber'=>null, 'Email'=>null, 'Login'=>null, 'Password'=>null,
		'Billing_Name'=>null, 'Billing_Email'=>null, 'Billing_PhoneNumber'=>null, 'Billing_Address'=>null,
		'PaymentPlan'=>'^[28]$',
		'AgeGroup'=>'^(<12|12-14|15-20|21-35|36-50|51-65|66\+)$',
		'CreditCard_Number'=>'[0-9- ]{11,32}',
		'CreditCard_Expiration'=>'^\d\d\\/\d\d$',
		'CreditCard_CCV'=>'^\d\d\d$',
		'CanSendPromotion'=>'^[01]$'
	);

	//Add an error
	$Errors=Array(); //List of errors in format [Name, Error]. Error can either be a string that is in the translation file as "Error_STRING", or [STRING] as an html string
	$ValidVars=Array(); //All valid variables are stored here
	$OverwriteErrors=Array('CreditCard_Expiration'=>'Expiration', 'CreditCard_CCV'=>'CCV'); //If these variables fail the regex, use this error instead (translation file as "Error_STRING")
	$AddError=function($Name, $Error, $FromRegex=0) use (&$Errors, &$ValidVars, $OverwriteErrors) //Remove from the valid list and add to the error list
	{
		unset($ValidVars[$Name]);
		$Errors[]=Array($Name, $FromRegex && isset($OverwriteErrors[$Name]) ? $OverwriteErrors[$Name] : $Error);
	};

	//Variable confirmation
	foreach($AllVars as $VarName => $Check)
		if(!isset($_REQUEST[$VarName]) || !strlen($Val=trim($_REQUEST[$VarName]))) //Make sure all variables are defined and set
			$AddError($VarName, 'Required');
		else if($Check!==null && !preg_match('/'.$Check.'/uD', $Val)) //Match against regex
			$AddError($VarName, 'Invalid', 1);
		else if(mb_strlen($Val)>128) //Check against length
			$AddError($VarName, 'TooLong');
		else //Success
			$ValidVars[$VarName]=$Val;

	//Remove symbols from numeric fields
	foreach(Array('CreditCard_Number', 'CreditCard_Expiration') as $VarName)
		if(isset($ValidVars[$VarName]))
			$ValidVars[$VarName]=preg_replace('/\D/', '', $ValidVars[$VarName]);
	//Extra checks for other variables
	foreach(Array('Email', 'Billing_Email') as $VarName) //Verify email
		if(isset($ValidVars[$VarName]) && !filter_var($ValidVars[$VarName], FILTER_VALIDATE_EMAIL, FILTER_FLAG_EMAIL_UNICODE))
			$AddError($VarName, 'Invalid');

	if(isset($ValidVars['CreditCard_Expiration'])) //Verify expiration date
	{
		$CurYear=intval(date('y'), 10);
		for($i=0;$i<2;$i++)
			$DateParts[$i]=intval(substr($ValidVars['CreditCard_Expiration'], $i*2, 2), 10);
		if(
			$DateParts[0]<=0 || $DateParts[0]>12 ||
			$DateParts[1]<$CurYear ||
			($DateParts[1]==$CurYear && $DateParts[0]<intval(date('n'), 10))
		)
			$AddError('CreditCard_Expiration', 'Invalid');
	}

	//Check the username
	if(isset($ValidVars['Login']))
	{
		require_once('../Scripts/DSQL.php');
		$SQLConn=new DSQL();
		$SQLConn->PrintAndDieOnError=false;
		if(DSQL::Query('SELECT ID FROM Users WHERE Username=?', $ValidVars['Login'])->FetchNext()!==FALSE)
			$AddError('Login', 'UserNameTaken');
	}

	//If there are errors, return the errors
	if(count($Errors))
		return Array('Result'=>'Errors', 'Errors'=>$Errors);

	//Update other variables
	global $GlobalConfig;
	$ValidVars['Password']=password_hash($GlobalConfig['PasswordSecret'].$ValidVars['Password'], PASSWORD_BCRYPT);
	$ValidVars['Username']=$ValidVars['Login'];
	unset($ValidVars['Login']);

	//Return an error
	function RetErr($String, $IncludeContact=true) { return Array('Result'=>'Error', 'Errors'=>htmlentities($String, ENT_QUOTES).($IncludeContact ? '<br>Please contact info@academiegregory.com with this error.' : '')); }

	//Submit to stripe
	require_once('../Scripts/stripe-php/init.php');
	\Stripe\Stripe::setApiKey($GlobalConfig['StripeSecretKey']);
	try {
		$Source=\Stripe\Token::create(Array(
			'card' => Array(
				'number'=>$ValidVars['CreditCard_Number'],
				'exp_month'=>intval(substr($ValidVars['CreditCard_Expiration'], 0, 2), 10),
				'exp_year'=>2000+intval(substr($ValidVars['CreditCard_Expiration'], 2, 2), 10),
				'cvc'=>$ValidVars['CreditCard_CCV'],
			)
		));
	} catch(Exception $e) {
		return RetErr($e->getMessage(), false);
	}
	foreach(Array('Number', 'Expiration', 'CCV') as $VarName) //Forget this information now that we have a token
		unset($ValidVars['CreditCard_'.$VarName]);
	$ValidVars['Stripe_CardToken']=$Source->card->id;

	try {
		$Customer=\Stripe\Customer::create(Array(
			'email'=>		$ValidVars['Email'],
			'description'=>	sprintf("%s [%s %s]", $ValidVars['Username'], $ValidVars['FirstName'], $ValidVars['LastName']),
			'source'=>		$Source->id,
		));
		$ValidVars['Stripe_ClientID']=$Customer->id;
	} catch(Exception $e) {
		return RetErr($e->getMessage());
	}

	//Submit to the database
	try {
		DSQL::Query(sprintf('INSERT INTO Users (%s) VALUES (%s)', implode(', ', array_keys($ValidVars)), DSQL::PrepareList($ValidVars)), $ValidVars);
	} catch(Exception $e) {
		return RetErr($e->Error);
	}

	//---Send the email---
	$From='info@academiegregory.com';
	$Headers=Array(
		'From: '.$From,
		'Reply-To: '.$From,
		'MIME-Version: 1.0',
		'Content-Type: text/html; charset=UTF-8',
	);
	$Headers=implode("\r\n", $Headers);

	//Compile the subject
	$Subject='Bienvenue à l’Académie Gregory';
	$Subject='=?utf-8?B?'.base64_encode($Subject).'?=';

	//Send the message
	require_once('../Scripts/Translate.php');
	require_once('WelcomeMessage.php');
	mail($ValidVars['Email'], $Subject, GetWelcomeMessage(GetCurLang()), $Headers, '-f "'.$From.'"');

	//Return success
	return Array();
}
?>