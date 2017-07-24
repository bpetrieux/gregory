<?
//See notes in Translate.js
function LSR($SectionName, $Default, $KeyString=null)
{
	//Load the translation for the section
	static $Translations=Array();
	if(!isset($Translations[$SectionName]))
	{
		//Get the translation directory
		$SpecialSections=Array('Library'=>'Scripts', 'BrowserParent'=>'BrowserParent', 'SharedAssets'=>'SharedAssets', 'ScanningStation'=>'ScanningStation', 'CalculateCarReturn'=>'SharedAssets/CalculateCarReturn');
		$TranslationDirectory=(isset($SpecialSections[$SectionName]) ? $SpecialSections[$SectionName] : "Pages/$SectionName");

		//Load the translations
		foreach(glob(__DIR__."/../$TranslationDirectory/Translations.*.js") as $TranslationFile)
		{
			//Extract the section and language from the first line
			$FileLines=explode("\n", file_get_contents($TranslationFile));
			preg_match('/AddTranslations\([\'"](.*?)[\'"],\s*[\'"](\w+)[\'"],\s*{\s*$/', $FileLines[0], $TranslationInfo);
			if(!$TranslationInfo)
				continue;
			$TranslationInfo=array_combine(Array('EntireString', 'SectionName', 'LanguageIdentifier'), $TranslationInfo);

			//Decode the translations and save it to the global translation array
			$NewTranslations=Array();
			foreach(array_slice($FileLines, 1, -1) as $Line)
			{
				//Get the key
				if(($Split=ExtractJSString($Line))===null)
					continue;
				list($Key, $Line)=$Split;

				//Confirm the separating colon
				$Line=ltrim($Line);
				if($Line[0]!=':')
					continue;
				$Line=substr($Line, 1);

				//Get the value
				if(($Split=ExtractJSString($Line))===null)
					continue;
				list($Value, $Line)=$Split;

				//Confirm proper line ending (nothing except an optional comma and/or comment)
				if(!preg_match('/^\s*,?\s*(\/\/|$)/uD', $Line))
					continue;

				//Add to the translations array
				$NewTranslations[$Key]=$Value;
			}

			//Merge into the Translations variable
			$TranslateArray=&$Translations[$TranslationInfo['SectionName']][$TranslationInfo['LanguageIdentifier']];
			if(!isset($TranslateArray))
				$TranslateArray=$NewTranslations;
			else
				$TranslateArray=array_merge($TranslateArray, $NewTranslations);
		}
	}

	//Get the default language
	require_once(__DIR__.'/../../CONFIG/Config.php');
	global $DefaultTranslationLanguage;

	//Confirm the key string
	if(!isset($KeyString))
		$KeyString=$Default;

	//Find the translation
	$LookupChain=Array($SectionName, GetCurLang(), $KeyString);
	for($i=0;$i<2;$i++)
	{
		//Look up the translation from the currently searched language [First CurLang, then DefaultTranslationLanguage]
		$CurPart=&$Translations;
		foreach($LookupChain as $PartName)
			if(($CurPart=&$CurPart[$PartName])===null)
				break;
		if($CurPart!==null) //If translation is found
			return (string)$CurPart; //Remove the reference

		//On the second loop, look up the DefaultTranslationLanguage
		$LookupChain[1]=$DefaultTranslationLanguage;
	}

	//If translation is not found, use the default
	return $Default;
}

//Get the current language
function GetCurLang()
{
	//Retrieve the current language
	global $CurLang;
	if(isset($CurLang)) //If previously retrieved, no need to look it up again in a cooke
		return $CurLang;
	else if(isset($_COOKIE['LanguagePreference'])) //Look up in coookie
		return ($CurLang=$_COOKIE['LanguagePreference']);

	//If cookie does not yet exist, return the default, but don't permanently set it in case the cookie gets set later
	global $DefaultTranslationLanguage;
	return $DefaultTranslationLanguage;
}

function ExtractJSString($S) //Returns Array(ResultString, RestOfOriginalString), or null on error
{
	//Determine the first character of the string section
	$S=ltrim($S);
	if($S=='')
		return null;
	$QuoteChar=$S[0];

	//If a non quoted key name, just extract the word
	if($QuoteChar!='"' && $QuoteChar!="'")
	{
		preg_match('/^(\w+)(.*)$/uD', $S, $Matches);
		return $Matches ? array_slice($Matches, 1) : null; //Return error if first character is not a word character
	}

	//Find the end of the string section
	for($i=1;$i<strlen($S);$i++)
		if($S[$i]=='\\') //Skip the next character on a backslash
			$i++;
		else if($S[$i]==$QuoteChar) //Ending quote for the string
			break;
	if($i>=strlen($S)) //If no ending quote is found, return error
		return null;
	$StrSectionEnd=$i;

	//Process the string
	$FinalStr=Array();
	for($i=1;$i<$StrSectionEnd;$i++) //Remove the quotes from the string and iterate over characters
		if(($Char=$S[$i])!='\\') //Normal character
			$FinalStr[]=$Char;
		else if(stripos('nrtbf', $Char=$S[++$i])!==FALSE) //Escaped character
			$FinalStr[]=strtr(strToLower($Char), 'nrtbf', "\n\r\t \f");
		else if(strToLower($Char)!='x') //Just put the next character, as if there was not an escape
			$FinalStr[]=$Char;
		else //Process hexidecimal character
		{
			preg_match('/^[0-9a-f]{0,4}/i', substr($S, $i+1), $HexString);
			if(!strlen($HexString[0])) //Invalid hex string
				return null;
			$FinalStr[]=mb_convert_encoding(pack('N', hexdec($HexString[0])), 'UTF-8', 'UTF-32');
			$i+=strlen($HexString[0]);
		}
	return Array(implode('', $FinalStr), substr($S, $StrSectionEnd+1));
}
?>