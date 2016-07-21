//Init login screen toggle-a, slider-a i datetimepicker-a

$('.toggle').click(function(){
  // Switches the Icon
  $(this).children('i').toggleClass('fa-pencil');
  // Switches the forms  
  $('.form').animate({
    height: "toggle",
    'padding-top': 'toggle',
    'padding-bottom': 'toggle',
    opacity: "toggle"
  }, "slow");
});

var chk = document.querySelector('.js-switch');
var rememberMeSwitch = new Switchery(chk, { color: '#2991B7', size: 'small' });

$('.tp-banner').revolution({
	//Config slidera
	dottedOverlay:"none",
	delay:16000,
	startwidth:1000,
	startheight:450,
	hideThumbs:200,
	thumbWidth:100,
	thumbHeight:50,
	thumbAmount:5,
	navigationType:"none",
	navigationArrows:"solo",
	navigationStyle:"preview2",
	touchenabled:"off",
	onHoverStop:"on",
	swipe_velocity: 0.7,
	swipe_min_touches: 1,
	swipe_max_touches: 1,
	drag_block_vertical: false,
	parallax:"mouse",
	parallaxBgFreeze:"on",
	parallaxLevels:[7,4,3,2,5,4,3,2,1,0],
	keyboardNavigation:"on",
	navigationHAlign:"center",
	navigationVAlign:"bottom",
	navigationHOffset:0,
	navigationVOffset:20,
	soloArrowLeftHalign:"left",
	soloArrowLeftValign:"center",
	soloArrowLeftHOffset:20,
	soloArrowLeftVOffset:0,
	soloArrowRightHalign:"right",
	soloArrowRightValign:"center",
	soloArrowRightHOffset:20,
	soloArrowRightVOffset:0,
	shadow:0,
	fullWidth:"on",
	fullScreen:"off",
	spinner:"spinner4",
	stopLoop:"on",
	stopAfterLoops:0,
	stopAtSlide:1,
	shuffle:"off",
	autoHeight:"off",						
	forceFullWidth:"off",						
	hideThumbsOnMobile:"off",
	hideNavDelayOnMobile:1500,						
	hideBulletsOnMobile:"off",
	hideArrowsOnMobile:"off",
	hideThumbsUnderResolution:0,
	hideSliderAtLimit:0,
	hideCaptionAtLimit:0,
	hideAllCaptionAtLilmit:0,
	startWithSlide:1,
	fullScreenOffsetContainer: ""	
});	

$('#timepicker').datetimepicker({
	format: 'HH:mm'
});