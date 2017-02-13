(function() {

	var bodyEl = document.body,
		content = document.querySelector( '.content-wrap' ),
		openbtn = document.getElementById( 'open-btn' ),
		closebtn = document.getElementById( 'close-button' ),
		isOpen = false,

		morphEl = document.getElementById( 'morph-shape' ),
		s = Snap( morphEl.querySelector( 'svg' ) );
		path = s.select( 'path' );
		initialPath = this.path.attr('d'),
		steps = morphEl.getAttribute( 'data-morph-open' ).split(';');
		stepsTotal = steps.length;
		isAnimating = false;

	function init() {
		initEvents();
	}

	function initEvents() {
		openbtn.addEventListener( 'click', toggleMenu );
		if( closebtn ) {
			closebtn.addEventListener( 'click', toggleMenu );
		}

		// close the menu element if the target it´s not the menu element or one of its descendants..
		content.addEventListener( 'click', function(ev) {
			var target = ev.target;
			if( isOpen && target !== openbtn ) {
				toggleMenu();
			}
		} );
	}

	function toggleMenu() {
		if( isAnimating ) return false;
		isAnimating = true;
		if( isOpen ) {
			classie.remove( bodyEl, 'show-menu' );
			$('.menu-btn').css("display","block");
			// animiraj path
			setTimeout( function() {
				// reset patha
				path.attr( 'd', initialPath );
				isAnimating = false; 
			}, 300 );
		}
		else {
			classie.add( bodyEl, 'show-menu' );
			$('.menu-btn').css("display","none");
			// animiraj path
			var pos = 0,
				nextStep = function( pos ) {
					if( pos > stepsTotal - 1 ) {
						isAnimating = false; 
						return;
					}
					path.animate( { 'path' : steps[pos] }, pos === 0 ? 400 : 500, pos === 0 ? mina.easein : mina.elastic, function() { nextStep(pos); } );
					pos++;
				};

			nextStep(pos);
		}
		isOpen = !isOpen;
	}

	init();
	
	$('.icon-list a').click(function(event){
	
		event.preventDefault();
		
		if ($(this).hasClass("menu-active") == true){
			//Element već ima tu klasu
			return;
		}
		
		//Meni active klase
		$('.icon-list a').removeClass("menu-active");
		$(this).addClass("menu-active");
		
		//Dohvaćanje atributa
		var section = "#" + $(this).attr('href'); 
		var title = $(this).text();
		
		setSection(section,title);
	
	});	
	
	function setSection(section,title) {
	
		if (section != "##"){
		
			$(" #section-1, #section-2, #section-3 ").css("display","none"); //Sakriji sve sekcije
			$("#page-title").text(title); //Promijeni title
			$(section).fadeIn( "slow" ); //Otkriji traženu sekciju animacijom
		
		}
	
	}

})();