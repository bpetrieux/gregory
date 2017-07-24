$( document ).ready(function() {
	MoveTo();
	hamburger();
  //menuMobile();
  priceSelector();
} );
function priceSelector(){
	$(".register_selector a").on("click", function (event) {
		event.preventDefault();
		var current = $(this).data('plan');
		$('.link-actif').removeClass('link-actif');
		$(this).addClass('link-actif');
		$('.plan_actif').removeClass('plan_actif');
			$('.'+current).addClass('plan_actif');

	});
}
function hamburger(){
	$("#hamburger").on("click", function (e) {
		$("body").toggleClass("menu-mobile-actif");
	});
}
function MoveTo() {
    // Select all links with hashes
    jQuery('a[href*="#"]')
  // Remove links that don't actually link to anything
  .not('[href="#"]')
  .not('[href="#0"]')
  .click(function(event) {
    // On-page links
    if (
    	location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
    	&& 
    	location.hostname == this.hostname
    	) {
      // Figure out element to scroll to
  var target = jQuery(this.hash);
  target = target.length ? target : jQuery('[name=' + this.hash.slice(1) + ']');
      // Does a scroll target exist?
      if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        jQuery('html, body').animate({
        	scrollTop: target.offset().top
        }, 2000, function() {
          // Callback after animation
          // Must change focus!
          var jQuerytarget = jQuery(target);
          jQuerytarget.focus();
          if (jQuerytarget.is(":focus")) { // Checking if the target was focused
          	return false;
          } else {
            jQuerytarget.attr('tabindex','-1'); // Adding tabindex for elements not focusable
            jQuerytarget.focus(); // Set focus again
        };
    });
    }
}
});
}