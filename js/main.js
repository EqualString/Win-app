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

//alert("path="+gui.App.dataPath);

//Connectivity flags
var server_connect = false, web_connect; 

//App variables
var userID, dates = [];
var faded = 750;

//Header za POST
var headers = {
	'Content-Type': 'application/x-www-form-urlencoded'
};

window.onload = function() {

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
	
		//Test Server-a
		http_request.post("http://localhost:8074/api/app-test", {headers: headers}, function(err, response, body){
			if (err) {
				server_connect = false;
				webTest(web_connect,server_connect);
				return;
			}
			else if (response.statusCode == 200){
			
				if(body == "up&running"){ //Server je podignut i radi
				
					server_connect = true; //Flag = true

					db.find({ rememberMeToken: true }, function (err, docs) { //Dohvaćanje spremljenih podataka, ako je token = true
						
						if(docs != ''){ //Postoji takav dokument
						
							var username = docs[0].username;
							var passwd = docs[0].password;
							
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
	
};

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

//Otvaranje linka u browseru
$('#footer-link').click( function (){
	gui.Shell.openExternal("http://aquatest-testfeed.rhcloud.com/login");
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
	http_request.post("http://localhost:8074/api/app-login", {form: {user: username, pass: passwd}, headers: headers}, function(err,response,body){
		if (err) {
			return;
		}
		else if (response.statusCode == 200){
		
			setTimeout( function() {
				$(".loading").css("display","none");
				$("#inputs").fadeIn(faded).css("display","block");
					
				//Podaci dobiveni od Worker aplikacije (server-a)
				if (body == "login-error"){ //Greška na serveru
					$('#must1').css("display","none");
					$('#must3').css("display","none");
					$('#must4').css("display","none");
					$('#must5').css("display","none");
					$('#must2').fadeIn(faded).css("display","inline-block");
				}
				else if (body == "wrong-username"){ //Krivo korisničko ime
					$('#must1').css("display","none");
					$('#must2').css("display","none");
					$('#must3').css("display","none");
					$('#must5').css("display","none");
					$('#must4').fadeIn(faded).css("display","inline-block");
				}
				else if (body == "wrong-password"){ //Kriva lozinka
					$('#must1').css("display","none");
					$('#must2').css("display","none");
					$('#must3').css("display","none");
					$('#must4').css("display","none");
					$('#must5').fadeIn(faded).css("display","inline-block");
				}
				else{

					var serverData = JSON.parse(body);

					userID = serverData.userId;
					dates = serverData.times;

					create_table();
					$('#login-switch').css('display','none');
					$('#logout-switch').css('display','block');
					$('#login').css('display','none');
					$('#slider').fadeIn(780).css('display','block');
					
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
		$('#table-time1 > tbody:last-child').append(
			'<tr><td>'+(i+1)+'</td><td class="data">'+dates[i]+'</td><td><label class="cr-styled"><input type="checkbox" ng-model="todo.done"><i class="fa"></i></label></td></tr>');
		}
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
	create_table();
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
	if ((val != "")&&(i < 5)&&(same == false)){ //max 5
		i++;
		dates.push(val);
		$('#table-time1 > tbody:last-child').append(
			'<tr><td>'+i+'</td><td class="data">'+val+'</td><td><label class="cr-styled"><input type="checkbox" ng-model="todo.done"><i class="fa"></i></label></td></tr>');
	}
}

function saveTable (){
	dates.sort(); //Sort vrijednosti
	resolve_table();
	var sendData='';
	var len = dates.length;
	for( i=0; i<len; i++){
		sendData += dates[i] + '||';
	}
}