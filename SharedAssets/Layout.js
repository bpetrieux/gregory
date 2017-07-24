var DefaultTranslationLanguage='en';
var OverwriteStartLanguage='fr';
var LanguageList=['en', 'fr'];
var Debug=false;
GetDocumentParam();

$(document).ready(function() {
	//Language picker
	$('#LanguagePickerCircle').click(function(e) {
		e.preventDefault();
		UpdateLanguage(CurLang=='en' ? 'fr' : 'en');
	});
	if(!window.CurLang)
		window.CurLang=GetStartLanguage();

	//Handle request errors
	DWCFRequest.prototype.HandleError=function(ErrorMessage, ErrorCode) {
		alert(ErrorMessage);
		if(Debug) console.log(ErrorMessage);
	};
	DWCFRequest.prototype.ExecuteCompleteFuncOnRequestIgnored=false;
});