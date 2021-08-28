const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

exports.createMessage = async (req, res) => {
	if (!req.body.content || !req.body.chatId) {
		console.log('Invalid data passed into request');
		return res.sendStatus(400);
	}

	var newMessage = {
		sender: req.session.user._id,
		content: req.body.content,
		chat: req.body.chatId,
	};
	try {
		let message = await Message.create(newMessage);
		message = await message.populate('sender').execPopulate();
		message = await message.populate('chat').execPopulate();
		message = await User.populate(message, { path: 'chat.users' });

		const chat = await Chat.findByIdAndUpdate(req.body.chatId, {
			latestMessage: message,
		}).catch(e => {
			if (!e.statusCode) {
				e.statusCode = 500;
			}
			next(e);
		});

		insertNotifications(chat, message);
		res.status(201).send(message);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

function insertNotifications(chat, message) {
	chat.users.forEach(userId => {
		if (userId.toString() === message.sender._id.toString()) return;

		Notification.insertNotification(
			userId,
			message.sender._id,
			'newMessage',
			message.chat._id
		);
	});
}
