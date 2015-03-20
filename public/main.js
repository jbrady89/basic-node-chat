$(function(){

	var socket = io.connect();
	var $messageForm = $('#send-message');
	var $messageBox = $('#message');
	var $chat = $("#chat");
	var $login = $('#login');
	var $username = $('#username');
	var $loginContainer = $('#loginContainer');
	var $user;
	console.log(socket);

	$messageForm.submit(function(e){
		e.preventDefault();
		socket.emit('send message', { "message": $messageBox.val() , "username" : $user } );
		$messageBox.val('');
	});

	$login.submit(function(e){

		console.log("submit");
		e.preventDefault();
		socket.emit('user joined', { "username" : $username.val(), "socketId" : socket.id } );
		//socket.emit("abc", $username.val());
		console.log($username.val());
		$('#connectionStats').show();
		$user = $username.val();
		$username.val('');
		$loginContainer.hide();
		$chat.show();
		$messageForm.show();
		$chat.append("<i>welcome to the chat, " + $user+ "!</i><br/ >")			

		
	});

	socket.on("new message", function(data){
		var objDiv = document.getElementById("chat");
		$chat.append("<p style='width: 100%; word-wrap: break-word; margin: 0;'><span style='color:blue;'>" + data.username + "</span>: " + data.message + "</p>");
		objDiv.scrollTop = objDiv.scrollHeight;
	});

	socket.on("user joined", function(data){
		if (data.userExists){
			alert("user exists!");
		} else {
			console.log("user joined");
			if ($chat.css("display") == "block"){
				$chat.append("<i>"+ data.username + " has joined the chat!</i><br/>");
			} 
		}
	});
	var localUsers;
	socket.on("abc", function(users){
		console.log("add user");
		console.log(users);
		users.forEach(function(user){
			//console.log($('#users').find("span[data-user-id='" + user + "']").length)
			if ( !$('#usersList').find("span[data-user-id='" + user + "']").length > 0) {
				$('#usersList').append("<span data-user-id='" + user + "'>" + user + "</span></br>");
			}

		});
		//$('#users').append("<span data-user-id='" + data + "'>" + data + "</span></br>");
	});

	socket.on("remove user", function(data){
		$("span[data-user-id='" + data + "']").remove();

	});

	socket.on("user left", function(data){
		if (data.leaving){
			$chat.append("<i>"+ data.user + " has left the chat.</i><br/>");
		}	
	});


	socket.on("count", function(data){
		// update the displayed user count whenever the server receives an update
		console.log(data);
		$('#userCount').text( data.number );
	});

	window.onbeforeunload = function(e){
		socket.emit("user left", {"leaving": true, "user": $user} );
		socket.emit("remove user", $user);

	}
});