<?
header('Content-Type: text/html; charset=utf-8');
function PageHeader($PageSection, $ExtraHead='') { ?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>ACADÉMIE GREGORY</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script src="../Scripts/jquery.js"></script>
	<script src="../Scripts/Cookies.js"></script>
	<script src="../Scripts/DWCF.js"></script>
	<script src="../Scripts/GetDocumentParam.js"></script>
	<script src="../Scripts/Translate.js"></script>
	
	<link href="../SharedAssets/Layout.css" rel="stylesheet">
	<link href="../HOME/assets/styles/font.css" rel="stylesheet" />
	<script src="../SharedAssets/Layout.js"></script>
	<script src="../SharedAssets/Translations.Fr.js"></script>
	<link rel="icon" href="../SharedAssets/SiteIcon.png" type="image/png">
	
	<? //Temporary. Think this will become irrelevant when I go to angular ?>
	<link href="<?=$PageSection?>.css" rel="stylesheet">
	<script src="<?=$PageSection?>.js"></script>
	<script src="Translations.En.js"></script>
	<script src="Translations.Fr.js"></script>
	
	<?=$ExtraHead?>
</head>
<body lang=en>
<div class=Header>
	<a href=""><div class=MainLogo></div></a>
	<div id=LanguagePickerContainer class=TranslationSection data-SectionName=SharedAssets><div id=LanguagePickerCircle><a id=LanguagePickerText class=Translate data-TranslationKey=LanguageName href="#">EN</a></div></div>
</div>
<div id=ContentContainer class=TranslationSection data-SectionName=<?=$PageSection?>>
<? } ?>
<? function PageFooter() { ?>
</div>
<div class=Footer>

</div>
</body></html>
<? } ?>