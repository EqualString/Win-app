var gui = require('nw.gui');
var win = nw.Window.get();

$('#close_app').click(function (){
	win.close();
});