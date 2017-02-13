/* 
|------------------------------------------|
| AquaFeed - IoT Desktop App               |
|------------------------------------------|
| @author:  Egredžija Alen                 |
| @version: 2.5 (13.10.2015)               |
| @website: http://aquafeed.cleverapps.io  |
|------------------------------------------|
*/

//Dohvaćanje dodatnih nodejs modula
var moment = require('./node_modules/moment');
var http_request = require('./node_modules/request');

//Povezivanje na lokalnu neDB bazu
var Datastore = require('./node_modules/nedb');
var path = require('path');
var db = new Datastore({ filename: path.join(require('nw.gui').App.dataPath, 'locale.db') });

var gui = require('nw.gui');
var win = gui.Window.get(); //Funckije prozora
win.showDevTools(); //Developer tools

var chk = document.querySelector('.js-switch');
var rememberMeSwitch = new Switchery(chk, { color: '#2991B7', size: 'small' });

//Connectivity flags
var server_connect = false, web_connect; 

//App variables
var app_token, userID, dates = [];
var faded = 750, autoLogin = false;

//Header za POST
var headers = {
	'Content-Type': 'application/x-www-form-urlencoded'
};

//Preloader
Royal_Preloader.config({
    mode:           'text',
    text:           'AQUAFEED©',
    timeout:        1.73,
    showInfo:       true,
    opacity:        1,
    background:     ['#33B5E5'],
	onComplete:     controller()
});

function controller() {

	//Web conection flag
	var web_connect = window.navigator.onLine; //ako je online = true, offline = false
	
	db.loadDatabase(); //Dohvaćanje baze
	
	//Prazna baza podataka
	var doc = {
		appinfo: "user",
		rememberMeToken: false
    }; 
	
	db.find({ appinfo: "user" }, function (err, oldDoc) { 
		if(oldDoc == ''){ 
			db.insert(doc, function (err, newDoc) {});	
		}
	});

	//Test servera
	if (web_connect == true){
	
		
		http_request.post("http://worker-testfeed.rhcloud.com/api/app-test", {headers: headers}, function(err, response, body){
			if (err) {
				server_connect = false;
				webTest(web_connect,server_connect);
				return;
			}
			else if (response.statusCode == 200){
			
				if(body == "up&running"){ //Server je podignut i radi
				
					server_connect = true; //Flag = true

					db.find({ rememberMeToken: true }, function (err, docs) { //Dohvaćanje spremljenih podataka, ako je token = true
						
						if(docs != ''){ //Postoji takav dokument -> AutoLogin
						
							var username = docs[0].username;
							var passwd = docs[0].password;
							
							autoLogin = true;
							rememberMeSwitch.disable();
							
							$(".loading").fadeIn(faded).css("display","block");
							$("#inputs").css("display","none");
							$("#username").val(username);
							$("#passwd").val(passwd);
							makeLogin(username,passwd);
							
						}
						
					});
				}
				else{
					server_connect = false;
					webTest(web_connect,server_connect);
				}

			}
			else{
				server_connect = false;
				webTest(web_connect,server_connect);
			}
			
		}); 
		
	}
	else{
		webTest(web_connect,server_connect);
	}
	
}

/** Komunikacija sa serverom, provjere **/

function webTest(web_connect,server_connect){
	
	//Obavijesti
	if ( web_connect === false ){
		$('#must3').css("display","none");
		$('#must2').css("display","none");
		$('#must4').css("display","none");
		$('#must5').css("display","none");
		$('#must1').fadeIn(faded).css("display","inline-block");
	}
	else if ( server_connect === false ){
		$('#must1').css("display","none");
		$('#must3').css("display","none");
		$('#must4').css("display","none");
		$('#must5').css("display","none");
		$('#must2').fadeIn(faded).css("display","inline-block");
	}
	
}

/** Settings **/

//Gui app fj-e
function close_app(){
	win.close();
}

function min_app(){
	win.minimize();
}

$("#logout-btn").on('click', function() {

	var doc = {
		appinfo: "user",
		rememberMeToken: false
	}; 

	//Novi podaci se ubacuju u bazu
	db.update({ appinfo: "user" }, doc, {}, function (err, numReplaced) {

		if(!err){
			win.close();			
		}

	});
	
});

//Otvaranje linka u browseru
$('#footer-link').click( function (){
	gui.Shell.openExternal("http://aqua-testfeed.rhcloud.com/login");
});

//Disable file drop over the application
window.addEventListener("dragover", function (e) {
    e = e || event;
    e.preventDefault();
}, false);

//Disable file drop over the application
window.addEventListener("drop", function (e) {
    e = e || event;
    e.preventDefault();
}, false);

//Disable file dragstart
window.addEventListener("dragstart", function (e) {
    e = e || event;
    e.preventDefault();
}, false);

//Js-fje
/** Autentikacija **/
function test_auth(){

	if (server_connect === true){
	
		var username = $("#username").val();
		var passwd = $("#passwd").val();
	
		if ((username == '')||(passwd == '')){
			$('#must1').css("display","none");
			$('#must2').css("display","none");
			$('#must4').css("display","none");
			$('#must5').css("display","none");
			$('#must3').fadeIn(faded).css("display","inline-block");
		}
		else{
			
			if(chk.checked == true){ //Zapamti prijavu i podatke
				
				var doc = { 
					appinfo: "user",
					rememberMeToken: true,
					username: username,
					password: passwd
				}; 
				
				//Novi podaci se ubacuju u bazu
				db.update({ appinfo: "user" }, doc, {}, function (err, numReplaced) {

					if(err){
						$('#must1').css("display","none");
						$('#must3').css("display","none");
						$('#must4').css("display","none");
						$('#must5').css("display","none");
						$('#must2').fadeIn(faded).css("display","inline-block");
					}
					else{
						$(".loading").fadeIn(faded).css("display","block");
						$("#inputs").css("display","none");
						makeLogin(username,passwd);
					}

				});	
			
			}
			else{
				
				var doc = {
					appinfo: "user",
					rememberMeToken: false
				}; 
				
				//Novi podaci se ubacuju u bazu
				db.update({ appinfo: "user" }, doc, {}, function (err, numReplaced) {
				
					if(err){
						$('#must1').css("display","none");
						$('#must3').css("display","none");
						$('#must4').css("display","none");
						$('#must5').css("display","none");
						$('#must2').fadeIn(faded).css("display","inline-block");
					}
					else{
						$(".loading").fadeIn(faded).css("display","block");
						$("#inputs").css("display","none");
						makeLogin(username,passwd);
					}
		
				});

			}
			
		}
	}
}

function makeLogin(username,passwd){
	
	//Slanje na worker aplikaciju
	http_request.post("http://worker-testfeed.rhcloud.com/api/app-login", {form: {user: username, pass: passwd}, headers: headers}, function(err,response,body){
		if (err) {
		
			$("#txt-error").html("");
			$("#txt-error").html("Došlo je do greške s povezivanjem na server.");
			$("#modal-error").modal("show");
			
			return;
		}
		else if (response.statusCode == 200){
		
			setTimeout( function() {
				$(".loading").css("display","none");
				$("#inputs").fadeIn(faded).css("display","block");
					
				//Podaci dobiveni od Worker aplikacije (server-a)
				if (body == "login-error"){ //Greška na serveru
					rememberMeSwitch.enable();
					$('#must1').css("display","none");
					$('#must3').css("display","none");
					$('#must4').css("display","none");
					$('#must5').css("display","none");
					$('#must2').fadeIn(faded).css("display","inline-block");
				}
				else if (body == "wrong-username"){ //Krivo korisničko ime
					rememberMeSwitch.enable();
					$('#must1').css("display","none");
					$('#must2').css("display","none");
					$('#must3').css("display","none");
					$('#must5').css("display","none");
					$('#must4').fadeIn(faded).css("display","inline-block");
				}
				else if (body == "wrong-password"){ //Kriva lozinka 
					rememberMeSwitch.enable();
					$('#must1').css("display","none");
					$('#must2').css("display","none");
					$('#must3').css("display","none");
					$('#must4').css("display","none");
					$('#must5').fadeIn(faded).css("display","inline-block");
				}
				else{

					var serverData = JSON.parse(body);

					//Korisničke varijable
					app_token = serverData._token;
					userID = serverData.userId;
					dates = serverData.times;

					create_table();
					
					$('#login-switch').css('display','none');
					
					if((chk.checked == true)||(autoLogin == true)){
						$('#logout-btn').css('display','block');
					}
					
					$('#login').css('display','none');
					$('.menu-btn').css("display","block");
					$('#page-title').css("display","block");
					$('body').addClass("content-background");
					$('.content-wrap').animate({ opacity:1 }, faded);
					
				}
			}, 2875);
		}
	}); 
}
/** Izgradnja tablice **/
function create_table() {

	$("#tablebody").html("");//Očisti
	var len = dates.length;
	for (i = 0;i < len; i++){
	
		if((i+1)%4 != 0){
			$('#table-time1 > tbody:last-child').append(
				'<tr><td>'+(i+1)+'</td><td class="data">'+dates[i]+'</td><td><label class="cr-styled"><input type="checkbox" ng-model="todo.done"><i class="fa"></i></label></td></tr>');
		}
		else{
			$('#table-time1 > tbody:last-child').append(
				'<tr class="noBorder"><td>'+(i+1)+'</td><td class="data">'+dates[i]+'</td><td><label class="cr-styled"><input type="checkbox" ng-model="todo.done"><i class="fa"></i></label></td></tr>');
		}	
		
	}
	pagerFunc();	
	
}

$("#delete_btn").on('click', function() {

	var checked = jQuery('input:checkbox:checked').map(function () {
		return this.value;
	}).get();
	jQuery('input:checkbox:checked').parents("tr").remove();
	resolve_table();
	
});

function resolve_table(){

	var i = 0;
	dates = [];
	$("#tablebody").find("tr").each(function() { //dohvati sve redove
		dates[i] = $(this).find('.data').html(); 
		i++;
	});
	dates.sort(); //Sort vrijednosti
	create_table(); //Napravi novu tablicu
	
}

function addRow (){

	var i=0,same = false;
	var val = $("#input-date").val();
	$("#tablebody").find("tr").each(function() {
		if(val == dates[i]){
			same = true; //Ako postoji takav zapis
		}
		i++;
	});
	if ((val != "")&&(same == false)){ //max 5
		dates.push(val);
		$('#table-time1 > tbody:last-child').append(
			'<tr><td>'+i+'</td><td class="data">'+val+'</td><td><label class="cr-styled"><input type="checkbox" ng-model="todo.done"><i class="fa"></i></label></td></tr>');
		resolve_table();
		pagerFunc();		
	}
	
}

function saveTable (){

	dates.sort(); //Sort vrijednosti
	var logTime = moment().format('DD/MM/YYYY HH:mm'); //Logtime
	var indicator = $(".corner-indicator");
	
	indicator.addClass("la-animate"); 
	
	//Slanje na worker aplikaciju
	http_request.post("http://worker-testfeed.rhcloud.com/api/app-timeUpdate", {form: { _token: app_token , userId: userID, logTime: logTime , timeData: dates}, headers: headers}, function(err,response,body){
		if (err) {
		
			indicator.removeClass("la-animate");
			$("#txt-error").html("");
			$("#txt-error").html("Došlo je do greške s povezivanjem na server.");
			$("#modal-error").modal("show");
			
			return;
		}
		else if (response.statusCode == 200){
			setTimeout( function() {
				if (body == "update-done"){
					indicator.removeClass("la-animate");
				} 
				else if(body == "db-error"){
					indicator.removeClass("la-animate");
					$("#txt-error").html("");
					$("#txt-error").html("Došlo je do greške s povezivanjem na AquaFeed bazu podataka.");
					$("#modal-error").modal("show");
				}
				else if(body == "token-error"){
					indicator.removeClass("la-animate");
					$("#txt-error").html("");
					$("#txt-error").html("Došlo je do greške sa nevrijedećim token ključem aplikacije.");
					$("#modal-error").modal("show");
				}
				else{
				    indicator.removeClass("la-animate");
					$("#txt-error").html("");
					$("#txt-error").html("Došlo je do greške sa serverom.");
					$("#modal-error").modal("show");
				}
			}, 1075);
		}
	}); 
	
}

//Funkcija za pager
function pagerFunc(){

	$('#table-time1').each(function() {
		var currentPage = 0;
		var numPerPage = 4;
		var $table = $(this);
		$table.bind('repaginate', function() {
			$table.find('tbody tr').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
		});
		$table.trigger('repaginate');
		var numRows = $table.find('tbody tr').length;
		var numPages = Math.ceil(numRows / numPerPage);
		var $pager = $('.pager');
		$pager.html('');
		for (var page = 0; page < numPages; page++) {
			$('<span class="btn btn-default btn-table page-number shadow"></span>').text(page + 1).bind('click', {
				newPage: page
			}, function(event) {
				currentPage = event.data['newPage'];
				$table.trigger('repaginate');
				$(this).addClass('active').siblings().removeClass('active');
			}).appendTo($pager).addClass('clickable');
		}
		$pager.insertAfter('#save-btn').find('span.page-number:first').addClass('active');
	});
	
}

//Trenutno hranjenje
function trenutno_nahrani(){
	
	var logTime = moment().format('DD/MM/YYYY HH:mm'); //Logtime
	var indicator = $(".corner-indicator");
	
	indicator.addClass("la-animate"); 
	
	//Slanje na worker aplikaciju
	http_request.post("http://worker-testfeed.rhcloud.com/api/app-feedNow", {form: { _token: app_token , userId: userID, logTime: logTime }, headers: headers}, function(err,response,body){
		if (err) {
		
			indicator.removeClass("la-animate");
			$("#txt-error").html("");
			$("#txt-error").html("Došlo je do greške s povezivanjem na server.");
			$("#modal-error").modal("show");
			
			return;
		}
		else if (response.statusCode == 200){
			setTimeout( function() {
				if (body == "done"){
					indicator.removeClass("la-animate");
				} 
				else if(body == "db-error"){
					indicator.removeClass("la-animate");
					$("#txt-error").html("");
					$("#txt-error").html("Došlo je do greške s povezivanjem na AquaFeed bazu podataka.");
					$("#modal-error").modal("show");
				}
				else if(body == "token-error"){
					indicator.removeClass("la-animate");
					$("#txt-error").html("");
					$("#txt-error").html("Došlo je do greške sa nevrijedećim token ključem aplikacije.");
					$("#modal-error").modal("show");
				}
				else{
				    indicator.removeClass("la-animate");
					$("#txt-error").html("");
					$("#txt-error").html("Došlo je do nepoznate greške sa serverom.");
					$("#modal-error").modal("show");
				}
			}, 1075);	
		}
	}); 

}
