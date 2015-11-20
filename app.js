var socketIOClient = require('socket.io-client');
var sailsIOClient = require('sails.io.js');
var readline = require('readline');
var five = require("johnny-five");
var board = new five.Board();

board.on("connect", function() {
  console.log('Board on connect');
});
board.on("ready", function() {
  console.log('Board Ready');
  //  this.pinMode(13, five.Pin.OUTPUT);
  var led = new five.Led(13);
  led.blink(100);
});
board.on("info", function(event) {
  /*
    Event {
      type: "info"|"warn"|"fail",
      timestamp: Time of event in milliseconds,
      class: name of relevant component class,
      message: message [+ ...detail]
    }
  */
  console.log("%s sent an 'info' message: %s", event.class, event.message);
});

/* Functions */
function loginAPI(){
	/* Authentication */
  connectSocket('ARDUINOO','contact@locka.com','7k6egICQB5ALmdm+Lt1oD1Soiz89pAwWyPqTHMgg2N7B98PCkr+0z59ruaJTTiOS', 'http://172.20.10.5:1337');
  return;
	var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});
  rl.question('Server url : ', function(ip) {
  	rl.question('Identifier : ', function(id) {
  		rl.question('Email : ', function(email) {
  			rl.question('API Key : ', function(api) {
  				rl.close();
  				connectSocket(id,email,api, ip)
  			});
  		});
  	});
  });
}

function connectSocket(id,email,api, ip) {
	/* Connect Socket IO */
	var io = sailsIOClient(socketIOClient);
	io.sails.url = ip || 'http://localhost:1337';

	io.socket.on('connect', function(){
		// Listening open event
		io.socket.on('openDoor', function(data){
		  console.log('Opening the door...');
		  console.log(data);
      var led = new five.Led(13);
      led.off();
		});
		// Listening close event
		io.socket.on('closeDoor', function(data){
		  console.log('Closing the door...');
		  console.log(data);
      var led = new five.Led(13);
      led.on();
		});
		// Subscribe my lock
		io.socket.get('/api/devices/subscribe/'+id, {access_token: api, email: email}, function (data) {
			if(data != null){
				if(data.msg != 'success') {
					console.log(data);
				}
			}
		});
		io.socket.on("device", function(data){
			console.log('--> ID : ' + data.data.name + ' state : ' + data.data.state);
		});
	});
	io.socket.on('disconnect', function(){
		console.log('Disconnected...');
	});
}

/* Main */
loginAPI();
