
var Room = require('../models/room');

var ioEvents = function(io) {

	// Rooms namespace
	io.of('/rooms').on('connection', function(socket) {

		// Create a new room
		socket.on('createRoom', function(title) {
			Room.findOne({'title': new RegExp('^' + title + '$', 'i')}, function(err, room){
				if(err) throw err;
				if(room){
					socket.emit('updateRoomsList', { error: 'This room name is not available.' });
				} else {
					Room.create({ 
						title: title
					}, function(err, newRoom){
						if(err) throw err;
						socket.emit('updateRoomsList', newRoom);
						socket.broadcast.emit('updateRoomsList', newRoom);
					});
				}
			});
		});
	});

	// Chatroom namespace
	io.of('/chatroom').on('connection', function(socket) {

		// Join a chatroom
		socket.on('join', function(roomId) {

			Room.findById(roomId, function(err, room){
				if(err) throw err;
				if(!room){
					socket.emit('updateUsersList', { error: 'Room is not found.' });
				} else {
					if(socket.request.session.passport == null){
						return;
					}

					Room.addUser(room, socket, function(err, newRoom){
						
						// Join the room
						socket.join(newRoom.id);
						Room.getUsers(newRoom, socket, function(err, users, cuntUserInRoom){
							if(err) throw err;
							socket.emit('updateUsersList', users, true);
							socket.broadcast.to(newRoom.id).emit('updateUsersList', users, true);
						});
					});
				}
			});
		});

		// Leave a chatroom
		socket.on('disconnect', function() {
			
			if(socket.request.session.passport == null){
				return;
			}
			Room.removeUser(socket, function(err, room, userId){
				if(err) throw err;

				socket.leave(room.id);
				socket.broadcast.to(room.id).emit('removeUser', userId);
			});
		});

		// Sent message
		socket.on('newMessage', function(roomId, message) {
			socket.broadcast.to(roomId).emit('addMessage', message);
		});
		// Typeing
		socket.on('typeing', function(roomId, username) {
			socket.broadcast.to(roomId).emit('dang-go', username);
		});
		// Not Typeing
		socket.on('out-typeing', function(roomId) {
			socket.broadcast.to(roomId).emit('ngung-go');
		});

	});
}

var init = function(app){

	var server 	= require('http').Server(app);
	var io 		= require('socket.io')(server);

	io.set('transports', ['websocket']);

	// Allow sockets to access session data
	io.use((socket, next) => {
		require('../session')(socket.request, {}, next);
	});

	ioEvents(io);

	return server;
}

module.exports = init;