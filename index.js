var express = require('express');
var app = express();
var server = require("http").createServer(app),
	io = require("socket.io").listen( server );

server.listen( process.env.PORT || 5000 );

app.get('/', function(request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.use("/public", express.static(__dirname + '/public'));

var users = []
io.sockets.on('connection', function(socket){
	
	//console.log(allClients);

	socket.on('send message', function(data){
		io.sockets.emit("new message", data);

		// to send to all connected clients except me
		//socket.broadcast.emit("new message", data);
	});

	socket.on('user joined', function(data){
		// send user count update to all clients when a new user connects to the server
		if ( users.indexOf(data.username) == -1){
			users.push(data.username)
		
			io.sockets.emit('count', {
				// http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients
				number:  io.engine.clientsCount
			});
			io.sockets.emit("abc" , users);
			
			socket.broadcast.emit("user joined", data);
		} else {
			io.to(data.socketId).emit("user joined", {"userExists": true});
		}
	});

	/*socket.on("abc", function(data){
		io.sockets.emit("abc", data);
	});*/

	socket.on('remove user', function(data){
		var userIndex = users.indexOf(data);
		users.splice(1, userIndex);
		io.sockets.emit("remove user", data);
	});

	socket.on('user left', function(data){
		// send the message when user leaves

		socket.broadcast.emit('user left', data);
	});

	socket.on("disconnect", function(socket){
		// update count when someone disconnects
		io.sockets.emit('count', {
			number: io.engine.clientsCount
		});
	});
	
});


