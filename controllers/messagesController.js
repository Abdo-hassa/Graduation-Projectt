const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const User = require('../models/User');

exports.getMessages = (req, res) => {
	const payload = {
		pageTitle: 'Inbox Page',
		userLoggedIn: req.session.user,
		userLoggedInJs: req.session.user,
	};
	res.render('messages/inboxPage', payload);
};
exports.newMessage = (req, res) => {
	const payload = {
		pageTitle: 'New Message',
		userLoggedIn: req.session.user,
		userLoggedInJs: req.session.user,
	};
	res.render('messages/newMessage', payload);
};

exports.getChatPage = async (req, res, next) => {
	let dots = 'assets/img/dots.gif';
	let userId = req.session.user._id;
	let chatId = req.params.chatId;
	let isValidId = mongoose.isValidObjectId(chatId);

	let payload = {
		pageTitle: 'chat',
		chatId: chatId,
		errorMessage: null,
		userLoggedIn: req.session.user,
		dots,
	};

	if (!isValidId) {
		const error = new Error('This is a broken link');
		next(error);
	}

	try {
		let chat = await Chat.findOne({
			_id: chatId,
			users: { $elemMatch: { $eq: userId } },
		}).populate('users');
		// if chat is null
		if (!chat) {
			// make sure chatId is not a user id
			let userFound = await User.findById(chatId);
			if (userFound) {
				chat = await getChatByUserId(userId, userFound._id);
			} else {
				const error = new Error('This chat is not exist.');
				return next(error);
			}
		}

		if (!chat) {
			payload.errorMessage = "you don't have access to this chat";
		} else {
			payload.chat = chat;
		}

		return res.render('messages/chatPage', payload);
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
