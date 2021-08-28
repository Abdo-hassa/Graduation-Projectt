const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const mongoose = require('mongoose');

exports.createChat = async (req, res) => {
	if (!req.body.users) {
		return alert('no users sent');
	}

	let users = JSON.parse(req.body.users);

	if (users.length === 0) {
		console.log('users array is empty');
	}

	users.push(req.session.user);

	let chatData = {
		users,
		isGroupChat: true,
	};

	try {
		const chat = await Chat.create(chatData);
		return res.send(chat);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.getChat = async (req, res) => {
	try {
		let result = await Chat.find({
			users: { $elemMatch: { $eq: req.session?.user?._id } },
		})
			.populate('users')
			.populate('latestMessage')
			.sort({ updatedAt: -1 });

		if (req.query.unreadOnly !== undefined && req.query.unreadOnly === 'true') {
			result = result.filter(
				res => !res.latestMessage?.readBy.includes(req.session.user._id)
			);
		}
		result = await User.populate(result, { path: 'latestMessage.sender' });
		return res.send(result);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

// PUT /chats/:chatId
exports.updateChatName = async (req, res) => {
	// req.body = { chatName: "whatever the new name is" }
	try {
		const result = await Chat.findByIdAndUpdate(req.params.chatId, req.body);
		return res.sendStatus(204);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

// GET /chats/:chatId
exports.getSingleChat = async (req, res) => {
	try {
		let chat = await Chat.findOne({
			_id: req.params.chatId,
			users: { $elemMatch: { $eq: req.session.user._id } },
		})
			.populate('users')
			.sort({ updatedAt: -1 });
		if (!chat) {
			// make sure chatId is not a user id
			let userFound = await User.findById({ _id: req.params.chatId });
			if (userFound) {
				chat = await getChatByUserId(userId, userFound._id);
			}
		}
		return res.send(chat);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

// GET /chats/:chatId/messages`
exports.getSingleChatMessages = async (req, res) => {
	try {
		const messages = await Message.find({ chat: req.params.chatId }).populate(
			'sender'
		);

		return res.send(messages);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.markMessagesAsRead = async (req, res) => {
	try {
		const messages = await Message.updateMany(
			{ chat: req.params.chatId },
			{ $addToSet: { readBy: req.session.user._id } }
		);

		return res.sendStatus(204);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

function getChatByUserId(userLoggedInId, anotherUserId) {
	return Chat.findOneAndUpdate(
		{
			isGroupChat: false,
			users: {
				$size: 2,
				$all: [
					{
						$elemMatch: {
							$eq: mongoose.Types.ObjectId(userLoggedInId),
						},
					},
					{
						$elemMatch: {
							$eq: mongoose.Types.ObjectId(anotherUserId),
						},
					},
				],
			},
		},
		{
			$setOnInsert: {
				users: [userLoggedInId, anotherUserId],
			},
		},
		{
			new: true,
			upsert: true,
		}
	).populate('users');
}
