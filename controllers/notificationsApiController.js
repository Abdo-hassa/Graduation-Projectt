const User = require('../models/User');
const Post = require('../models/Post');
const axios = require('axios');
const Roadmap = require('../models/Roadmap');
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
	try {
		let searchObj = {
			userTo: req.session.user._id,
			notificationType: { $ne: 'newMessage' },
		};

		if (req.query.unreadOnly !== undefined && req.query.unreadOnly === 'true') {
			searchObj.opened = false;
		}
		const notifications = await Notification.find(searchObj)
			.populate('userTo')
			.populate('userFrom')
			.sort({ createdAt: -1 });

		res.status(200).send(notifications);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.getLatestNotification = async (req, res, next) => {
	try {
		console.log('latest');
		const notifications = await Notification.findOne({
			userTo: req.session.user._id,
		})
			.populate('userTo')
			.populate('userFrom')
			.sort({ createdAt: -1 });

		res.status(200).send(notifications);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.markAsOpened = async (req, res, next) => {
	try {
		const notifications = await Notification.findByIdAndUpdate(req.params.id, {
			opened: true,
		});
		console.log('markasopened controller');
		res.sendStatus(204);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.markManyAsOpened = async (req, res, next) => {
	try {
		const notifications = await Notification.updateMany(
			{ userTo: req.session.user._id },
			{
				opened: true,
			}
		);
		res.sendStatus(204);
	} catch (e) {
		console.log(e);
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
