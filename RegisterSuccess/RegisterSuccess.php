<?
require_once('../SharedAssets/PageLayout.php');
require_once('../Register/WelcomeMessage.php');
PageHeader('RegisterSuccess');
?>
<div class="WelcomeMessage Translate Translated">
	<div class=en><?=GetWelcomeMessage('en')?></div>
	<div class=fr><?=GetWelcomeMessage('fr')?></div>
</div>
<? PageFooter(); ?>