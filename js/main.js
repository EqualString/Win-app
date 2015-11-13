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
var mqtt = require('./node_modules/mqtt');
var moment = require('./node_modules/moment');
var assert = require('assert');
var gui = require('nw.gui');

var win = gui.Window.get();
win.showDevTools();//Developer tools

//Connectivity flags
var server_connect = false, web_connect; 

//App variables
var data,ln,i,user=[],dates=[];
var client,client_listener,client_sender; //Mqtt clients
var faded = 750;

/** Komunikacija sa serverom **/
//Zatraživanje podataka od servera
client = mqtt.connect('mqtt://test.mosquitto.org'); 
client.subscribe('aquafeed-desktop');
client.publish('aquafeed-desktop', 'auth_info');
client.end();

//Primanje povratne informacije od servera 
client_listener = mqtt.connect('mqtt://test.mosquitto.org');
client_listener.subscribe('aquafeed-send-desktop');
client_listener.on('message', function (topic, message) {
	//Server conection flag -> true
	server_connect = true;
	$('#must2').css("display","none");
	client_listener.end();
	data = message.toString().split('||');
	ln = data.length;
	//Credentials
	user[0] = data[0];
	user[1] = data[1];
	//Dates
	for (i = 2; i< ln-2 ; i++){
		dates[i-2] = data[i];
	}
	create_table();
	client_listener.end();
});

/** Settings **/

//Gui app fj-e
function close_app(){
	win.close();
}
function min_app(){
	win.minimize();
}

//Web conection flag
var web_connect = window.navigator.onLine; //ako je online = true, offline = false

//Testiranje konekcije
if ( web_connect === false ){
	$('#must3').css("display","none");
	$('#must2').css("display","none");
	$('#must4').css("display","none");
	$('#must1').fadeIn(faded).css("display","inline-block");
}
else if ( server_connect === false ){
	$('#must1').css("display","none");
	$('#must4').css("display","none");
	$('#must4').css("display","none");
	$('#must2').fadeIn(faded).css("display","inline-block");
}

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
		var info = [];
		info[0] = document.getElementById("em").value;
		info[1] = document.getElementById("passwd").value;
		if((info[0] == '')||(info[1]== '')){
			$('#must1').css("display","none");
			$('#must2').css("display","none");
			$('#must4').css("display","none");
			$('#must3').fadeIn(faded).css("display","inline-block");
			
		}
		else if((info[0] == user[0])&&(info[1] == user[1])){
			$('#login').css('display','none');
			$('#slider').fadeIn(780).css('display','block');
		}
		else{
			$('#must1').css("display","none");
			$('#must2').css("display","none");
			$('#must3').css("display","none");
			$('#must4').fadeIn(faded).css("display","inline-block");
		}
	}
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
	//Slanje novih vrijednosti tablice na server
	client_sender = mqtt.connect('mqtt://test.mosquitto.org'); 
	client_sender.subscribe('aquafeed-desktop-new');
	client_sender.publish('aquafeed-desktop-new', sendData);
	client_sender.end();
}