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

transformGearOrigin('.gear1');
transformGearOrigin('.gear2');

//Transformacija centra rotacije
function transformGearOrigin(gearClass){	

	var gear = document.querySelector(gearClass),
		gearValues = gear.getBBox(),
		gearTransX = gearValues.x + gearValues.width/2,
		gearTransY = gearValues.y + gearValues.height/2;

	gear.style.transformOrigin = gearTransX+'px '+ gearTransY+'px';
	
} 	
		
var clock = $('#clockdate-full').FlipClock({
	clockFace: 'TwentyFourHourClock'
});

$('#timepicker').datetimepicker({
	format: 'HH:mm'
});