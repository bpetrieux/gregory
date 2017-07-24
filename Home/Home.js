//The home is its own special page and does not interact with the rest of the system
var DefaultTranslationLanguage='en';
var OverwriteStartLanguage='fr';
var LanguageList=['en', 'fr'];
GetDocumentParam();

$(document).ready(function() {
	$('a.playbutton').YouTubePopUp();

	//Language picker
	$('.LanguagePicker').click(function(e) {
		e.preventDefault();
		UpdateLanguage(CurLang=='en' ? 'fr' : 'en');
	});
	if(!window.CurLang)
		window.CurLang=GetStartLanguage();
});