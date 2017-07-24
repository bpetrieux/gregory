/*
LANGUAGE_IDENTIFIER:
	Should always be 2 lower case letters representating the language. For example, en for english, and fr for french.
	To update the current language, Call UpdateLanguage(LANGUAGE_IDENTIFIER). This function:
		Sets the window.CurLang to LANGUAGE_IDENTIFIER
			This variable is initially filled by "DefaultTranslationLanguage" (a javascript variable that must be set before document.ready).
		Gives the body a class of "Lang_" plus the currently set LANGUAGE_IDENIFIER (only the current language is kept).
		Manually updates all form input elements (see "Form text type and select elements" below)
Finding elements in the document to translate:
	Finding any elements that has the class "Translate" on them.
	Once the element has all its translations added, it has the class "Translated" added, so it is not translated again.
How the translation KEY_STRING is found for an element:
	For each found element that needs translating, the KEY_STRING is found in the attribute "data-TranslationKey".
	If this is not provided, the element’s internal html is used as the KEY_STRING.
How translations are added to the document:
	For each translation found for the SECTION_NAME+KEY_STRING, a span with the class of the LANGUAGE_IDENTIFIER and text[html] is added to the parent element as a child. For example <span class=fr>This is the french text</span>.
	Translations are inserted into their span as internal html, not internal text.
	The original internal html of the element is also extracted and used for the default language (DefaultTranslationLanguage; a javascript variable that must be set before document.ready) if not already provided.
How translations strings are found:
	Translations are found in the variable window.Translations. To look up translations, the SECTION_NAME, LANGUAGE_IDENTIFIER and KEY_STRING are used as window.Translations[SECTION_NAME][LANGUAGE_IDENTIFIER][KEY_STRING].
	All translation elements must have a single ancestor with the class of "TranslationSection". It must have an attribute of data-SectionName containing its SECTION_NAME.
How translations are added to the Translations variable:
	Translation strings are added by calling AddTranslations(SECTION_NAME, LANGUAGE_IDENTIFIER, TRANSLATION_LIST).
	TRANSLATION_LIST should be an object with the keys as the KEY_STRING, and the value as the translated text/html.
	Any attempt to call AddTranslations during load should look like the following code, enclosing the list of translations. This is to allow updates to be called after all translations have been loaded.
		if(!window.NumTranslationCalls) window.NumTranslationCalls=1; window.NumTranslationCalls++; AddTranslations(SECTION_NAME, LANGUAGE_IDENTIFIER, {
			//TRANSLATIONS GO HERE
		});
How the document decides which translation to show:
	All direct children of an element with the class "Translation" are set to display:none.
	Any direct child of the "Translation" element with the proper LANGUAGE_IDENTIFIER is set to display:auto.
	CSS CODE:
		.Translate>* { display:none; }
		.Lang_en .Translate .en { display:inline; } //There needs to be one of these lines for each language
Form text type and select elements:
	These elements must have a class "InputTranslate" instead of "Translate".
	These elements are manually updated on every language change, as their functionality cannot be taken care of by a class switch
	Form text type elements:
		The "placeholder" attribute is used instead of their internal html.
	Buttons:
		The "value" attribute is used instead of their internal html.
	For select+option form elements:
		Only the select needs the "InputTranslate" class (not the options)
		Only the options need a KEY_STRING
*/

//Update the currently displayed language
function UpdateLanguage(LanguageIdentifier)
{
	//Update the language variable and the body
	if(window.CurLang===undefined)
		CurLang=DefaultTranslationLanguage;
	$(document.body).removeClass('Lang_'+CurLang);
	CurLang=LanguageIdentifier;
	if(!window.DoNotStoreLang) //Do not set the cookie if requested
		SetCookie('LanguagePreference', CurLang, 60*60*24*365.25*5, undefined, '/'); //Expire in 5 years
	$(document.body).addClass('Lang_'+CurLang);

	//Update form elements
	UpdateFormElementsLanguage($('.InputTranslate'))
}

//Update the displayed language of form elements
function UpdateFormElementsLanguage($Elements)
{
	$Elements.each(function() {
		var e=$(this);
		var SectionName=e.parents('.TranslationSection').attr('data-SectionName');
		if(e.prop('tagName').toLowerCase()!='select') //If not select, just update the placeholder/value
		{
			//Get the translation key
			var UpdateProp=(
				e.prop('tagName').toLowerCase()=='input' && e.attr('type') && $.inArray(e.attr('type').toLowerCase(), ['button', 'submit'])!=-1 ? 'value' : //Input buttons use "value"
				(e.prop('tagName').toLowerCase()=='button' ? 'text' : 'placeholder') //Button uses "text", everything else (normal input elements) uses "placeholder"
			);
			var TranslationKey=e.attr('data-TranslationKey');
			if(TranslationKey===undefined) //Fill in by the placeholder/value if not given
				e.attr('data-TranslationKey', TranslationKey=e.attr(UpdateProp));

			//Make sure the default language is filled in
			if(!e.attr('DefaultLangFilled'))
			{
				var SetKey={};
				SetKey[TranslationKey]=e.attr(UpdateProp);
				e.attr('DefaultLangFilled', 'true');
				AddTranslations(SectionName, DefaultTranslationLanguage, SetKey, true, true);
			}

			//Get the language string. If the string does not exist in the language, use the default
			var LangToUse=(Translations[SectionName][CurLang] && Translations[SectionName][CurLang][TranslationKey]!==undefined ? CurLang : DefaultTranslationLanguage);
			var Translation=Translations[SectionName][LangToUse][TranslationKey];

			//Update the element and return
			if(UpdateProp=='text')
				e.text(Translation);
			else
				e.prop(UpdateProp, Translation);
			return;
		}

		//---For select elements, update all the options---
		//Get the default and current language translations
		if(!Translations[SectionName] || !Translations[SectionName][DefaultTranslationLanguage]) //Make sure the default translation array exists
			AddTranslations(SectionName, DefaultTranslationLanguage, {'CREATE_ARRAY':null}, true, true);
		var DefaultTranslations=Translations[SectionName][DefaultTranslationLanguage];
		var CurLangTranslations=Translations[SectionName][CurLang];
		if(CurLangTranslations===undefined) //Use default translations if current language does not exist
			CurLangTranslations=DefaultTranslations;

		//Update the options' texts
		e.children().each(function() {
			//Get the translation key
			var e=$(this);
			var TranslationKey=e.attr('data-TranslationKey');
			if(TranslationKey===undefined) //Fill in by the text if not given
				e.attr('data-TranslationKey', TranslationKey=e.text());

			//Make sure the default language is filled in
			if(!e.attr('DefaultLangFilled'))
			{
				e.attr('DefaultLangFilled', 'true');
				if(DefaultTranslations[TranslationKey]===undefined)
					DefaultTranslations[TranslationKey]=e.text();
			}

			//Get the language string. If the string does not exist in the language, use the default
			var LangToUse=(CurLangTranslations[TranslationKey]!==undefined ? CurLangTranslations : DefaultTranslations);
			e.text(LangToUse[TranslationKey]);
		});
	});
}

//Add translation strings to the translation table
function AddTranslations(SectionName, LanguageIdentifier, TranslationList, DoNotDecrementNumTranslationCalls, DoNotOverwrite)
{
	//Make sure the section+language exists
	if(!window.Translations)
		Translations={};
	if(!Translations[SectionName])
		Translations[SectionName]={};
	if(!Translations[SectionName][LanguageIdentifier])
		Translations[SectionName][LanguageIdentifier]={};

	//Merge the lists
	var MyList=Translations[SectionName][LanguageIdentifier];
	if(DoNotOverwrite) //Manual merge without overwrite
		$.each(TranslationList, function(Key, Val) {
			if(MyList[Key]===undefined)
				MyList[Key]=Val;
		});
	else //Quick merge
		$.extend(MyList, TranslationList);

	//If decrementing, and the end is reached, call insertion and update functions
	if(!DoNotDecrementNumTranslationCalls && --NumTranslationCalls==0)
	{
		InsertTranslations();
		UpdateLanguage(GetStartLanguage());
	}
}

//Get the Start Language as dictated by the query string, cookies, and navigator language (in that preferential order)
function GetStartLanguage()
{
	//Search for language in parameters and cookies
	var FinalLang;
	$.each([GetDocumentParam('Lang'), GetCookie('Lang'), GetCookie('LanguagePreference')], function(Dummy, CheckLang) {
		if(!CheckLang || $.inArray(CheckLang.toLowerCase(), LanguageList)==-1)
			return;
		FinalLang=CheckLang.toLowerCase();
		return false;
	});
	if(FinalLang)
		return FinalLang;

	//Otherwise, check the users browser preferences and see which language is prefered
	var Languages=navigator.languages;
	Languages=(!Languages ? [navigator.language] : navigator.languages.slice());
	for(var i=0;i<Languages.length;i++)
		if($.inArray(Languages[i]=Languages[i].toLowerCase().substr(0, 2), LanguageList)!=-1)
			return Languages[i];

	//If no preferred language is supported, use the default language
	return window.OverwriteStartLanguage ? OverwriteStartLanguage : DefaultTranslationLanguage;
}

//Insert translations into the document
function InsertTranslations()
{
	//Make sure every section has a translation array of its own
	$('.TranslationSection').each(function() {
		var SectionName=$(this).attr('data-SectionName');
		if(!Translations[SectionName])
			Translations[SectionName]={};
	});

	//Add translations to all requested elements that have not already been translate
	$('.Translate:not(.Translated)').each(function() {
		CreateTranslationElement($(this))
	});
}

function CreateTranslationElement($e, SectionName)
{
	//Mark element as translated
	$e.addClass('Translated');

	//Get the translation key
	var TranslationKey=$e.attr('data-TranslationKey');
	if(TranslationKey===undefined) //Fill in by the html if not given
		$e.attr('data-TranslationKey', TranslationKey=$e.html());

	//---Get the default translation---
	//Get the section name
	if(SectionName===undefined)
		SectionName=$e.parents('.TranslationSection').attr('data-SectionName');
	//Get the default value, which starts as the element’s HTML
	var Default=$e.html();
	var TSec=Translations[SectionName], TSecDefault;
	//If the language for the translation section does not yet exist, create it
	if(!(TSecDefault=TSec[DefaultTranslationLanguage]))
		TSecDefault=TSec[DefaultTranslationLanguage]={};
	//If the translation key already has a value, use that as the default
	if(TSecDefault[TranslationKey]!==undefined)
		Default=TSecDefault[TranslationKey];
	//Otherwise, store the current Default to that section’s DefaultTranslationLanguage translation key
	else
		TSecDefault[TranslationKey]=Default;

	//Fill in all the translations for the element
	$e.html(''); //Remove the current data
	$.each(LanguageList, function(Dummy, Language) {
		var Translation=Default;
		if(TSec[Language] && TSec[Language][TranslationKey]!==undefined)
			Translation=TSec[Language][TranslationKey];
		$('<span>').addClass(Language).html(Translation).appendTo($e);
	});

	return $e;
}

//Language selection functions
function GetTranslation(Section, Default, IsText, KeyString) //If KeyString is undefined, default is used as the title
{
	var El=$('<span>').addClass('Translate')[IsText ? 'text' : 'html'](Default);
	if(KeyString!==undefined)
		El.attr('data-TranslationKey', KeyString);
	if(!Translations[Section])
		Translations[Section]={};
	CreateTranslationElement(El, Section);
	return El;
}

//Guarantee translation insertions/updates is not called until all translation strings have been added
$(document).ready(function() {
	if(!window.NumTranslationCalls)
		window.NumTranslationCalls=1;
	AddTranslations('TRANSLATION_DUMMY_SECTION', DefaultTranslationLanguage, {});
});

//Get a translation (Localized String from Resource)
function LSR(SectionName, Default, KeyString)
{
	//Confirm the key string
	if(KeyString===undefined)
		KeyString=Default;

	//Find the translation
	var LookupChain=['Translations', SectionName, CurLang, KeyString];
	for(var i=0;i<2;i++)
	{
		//Look up the translation from the currently searched language [First CurLang, then DefaultTranslationLanguage]
		var CurPart=window;
		$.each(LookupChain, function(Dummy, PartName) {
			if((CurPart=CurPart[PartName])===undefined)
				return false;
		});
		if(CurPart!==undefined) //If translation is found
			return CurPart;

		//On the second loop, look up the DefaultTranslationLanguage
		LookupChain[2]=DefaultTranslationLanguage;
	}

	//If translation is not found, use the default
	return Default;
}