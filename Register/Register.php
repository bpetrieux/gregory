<?
require_once('../SharedAssets/PageLayout.php');
PageHeader('Register');
function B() { print "\n"; }
?>
<div id=Errors></div>
<form id=QuestionForm>
	<div class=Questions>
		<div>
			<span class=Translate data-TranslationKey=Field_NumberOfPayments>NumberOfPayments</span>
			<div class="Questions-payment"><select id=Field_PaymentPlan class=InputTranslate>
				<? foreach(Array(2, 8) as $PN) { ?>
					<option value=<?=$PN?> data-TranslationKey=PaymentPlan<?=$PN?>><?=$PN?></option>
				<? } B(); ?>
			</select></div>
		</div>
		<?
		foreach(Array(
			'FirstName', 'LastName', 'PhoneNumber', 'Email', 'Login', 'Password',
			'AgeGroup', 'Billing_Name', 'Billing_Email', 'Billing_PhoneNumber', 'Billing_Address',
			'CreditCard_Number', 'CreditCard_Expiration', 'CreditCard_CCV',
			'CanSendPromotion',
		) as $Type) { B();
			$AsInputType=function($InputType, $DifferentPlaceHolder=false, $IsRequired=true) use ($Type) {
				print
					"<input type=$InputType id=Field_$Type class=InputTranslate ".
					'data-TranslationKey='.($DifferentPlaceHolder ? 'FInput_' : 'Field_').$Type.
					($IsRequired ? ' required' : '').'>';
			}
		?>
		<div class="Questions-wrap <?=$Type?>" data-Type=<?=$Type?>>
			<div>
				<? switch($Type)
				{
					case 'PhoneNumber': 		$AsInputType('tel');			break;
					case 'Billing_PhoneNumber':	$AsInputType('tel');			break;
					case 'Email':				$AsInputType('email');			break;
					case 'Billing_Email':		$AsInputType('email');			break;
					case 'Password':			$AsInputType('password');		break;
					case 'AgeGroup':			print "<select id=Field_$Type class=InputTranslate><option value=0 disabled selected data-TranslationKey=SelectAgeGroup>Select Your Age Group</option></select>"; break;
					case 'CreditCard_Expiration':$AsInputType('text', 1);		break;
					case 'CreditCard_CCV':		$AsInputType('number', 1);		break;
					case 'CanSendPromotion':	$AsInputType('checkbox', 0, 0); print '<label for=Field_CanSendPromotion class=Translate data-TranslationKey=CanSendPromotion>CanSendPromotion</label>'; break;
					default:					$AsInputType('text');			break;
				} B(); ?>
			</div>
		</div>
		<? } ?>
	</div>
	<input type=submit class=SubmitButton>
</form>
<? PageFooter(); ?>