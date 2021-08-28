let connected = false;

let socket = io('http://localhost:3000');

socket.emit('setup', userLoggedIn);
socket.on('connected', () => (connected = true));
socket.on('message received', newMessage => messageReceived(newMessage));

socket.on('notification received', newNotification => {
	$.get('/api/notifications/latest', notificationData => {
		refreshNotificationBadge();
	});
});

function emitNotification(userId) {
	if (userId === userLoggedIn._id) return;
	console.log('emit notification');
	socket.emit('notification received', userId);
}
