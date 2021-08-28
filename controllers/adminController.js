const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Roadmap = require('../models/Roadmap');
const Topic = require('../models/Topic');
const Feedback = require('../models/Feedback');
const moment = require('moment');
var regex = new RegExp(
	'^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.))?(\\?(.))?'
);

exports.getDashboard = async (req, res) => {
	try {
		const users = await User.find(
			{ _id: { $ne: req.session.user._id.toString() } },
			{ password: 0 }
		);
		const posts = await Post.find({
			user: { $ne: req.session.user._id.toString() },
		})
			.sort({ createdAt: -1 })
			.populate('user');
		const roadmaps = await Roadmap.find({});
		const topics = await Topic.find({});
		res.render('dashboard/dashboard.ejs', {
			users,
			posts,
			roadmaps,
			topics,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
// =====================USer Dashboard========================

exports.getUserDashboard = async (req, res) => {
	try {
		const users = await User.find(
			{ _id: { $ne: req.session.user._id.toString() } },
			{ password: 0 }
		);
		res.render('dashboard/user/userdashboard.ejs', {
			users,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.deleteUser = async (req, res) => {
	const userId = req.params.id.toString();
	try {
		// if the deleted user is the currently logged in delete the session then delete user and redirect to home
		if (req.user._id.toString() === userId) {
			return req.session.destroy(async err => {
				console.log(err);
				await req.user.remove();
				res.redirect('/');
			});
		}
		// if the deleted user was the current logged in just redirect me to home page and delete it's session
		const user = await User.findById(userId);
		await user.remove();
		res.status(200).json({ message: 'Success!' });
	} catch (e) {
		res.status(500).json({ message: 'Deleting post failed.' });
	}
};
exports.getEditUserDashboard = async (req, res) => {
	const UserId = req.params.id;
	try {
		const roadmaps = await Roadmap.find({});
		const user = await User.findById(UserId, { password: 0 });

		res.render('dashboard/user/userEdit.ejs', {
			user,
			errorMassage: null,
			roadmaps,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.validateUser = [
	body('name', 'Name must be at least 4 characters in text or numbers only.')
		.exists()
		.isLength({ min: 4 }),
	body('bio', 'bio must be less than 120 characters').isLength({ max: 120 }),
];
exports.postEditUserDashboard = async (req, res) => {
	const userid = req.body.userid;
	const user = await User.findById(userid, { password: 0 });

	const name = req.body.name;
	const bio = req.body.bio;
	const country = req.body.country;
	const BirthDate = req.body.date_of_birth;
	const gender = req.body.gender;
	const skills = req.body.skills;
	const nativeLang = req.body.nativeLang;

	let image;
	let Image;
	image = req.file;

	if (image !== undefined) {
		Image = image.path;
	}
	const errors = validationResult(req);
	console.log(errors);
	if (!errors.isEmpty()) {
		let roadmaps;
		try {
			roadmaps = await Roadmap.find({});
		} catch (e) {
			if (!e.statusCode) {
				e.statusCode = 500;
			}
			next(e);
		}
		return res.status(422).render('dashboard/user/userEdit.ejs', {
			errorMassage: errors.array(),
			user,
			name,
			userid: userid,
			roadmaps,
			userLoggedIn: req.session.user,
		});
	}
	try {
		const user = await User.findOne({ _id: userid });
		user.name = name;
		user.bio = bio;
		user.country = country;
		user.yearOfBirth = BirthDate;
		user.gender = gender;
		if (skills !== undefined) {
			user.skills = skills;
		}
		user.nativeLang = nativeLang;
		if (image !== undefined) {
			user.Image = Image;
		}
		user.save();
		res.redirect('/admin/dashboard/users');
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

//=========================Post Dashboard ==========================
exports.getPostDashboard = async (req, res) => {
	try {
		const roadmaps = await Roadmap.find({});

		const posts = await Post.find({
			user: { $ne: req.session.user._id.toString() },
		})
			.sort({ createdAt: -1 })
			.populate('user');
		res.render('dashboard/posts/postsdashboard.ejs', {
			posts,
			moment,
			roadmaps,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.deletePost = async (req, res) => {
	const postId = req.params.id;

	try {
		await Post.findByIdAndDelete(postId);
		res.status(200).json({ message: 'Success!' });
	} catch (e) {
		res.status(500).json({ message: 'Deleting post failed.' });
	}
};

exports.getEditPostDashboard = async (req, res) => {
	const postId = req.params.id;
	try {
		const roadmaps = await Roadmap.find({});
		const post = await Post.findById({ _id: postId });
		res.render('dashboard/posts/postEdit.ejs', {
			post,
			roadmaps,
			errorMassage: null,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.postEditPostDashboard = async (req, res) => {
	const postId = req.body.postid;
	const description = req.body.description;
	try {
		const post = await Post.findById({ _id: postId });
		post.description = description;
		post.save();
		res.redirect('/admin/dashboard/posts');
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

//=====================Roadmaps =======================

exports.getRoadmapDashboard = async (req, res) => {
	try {
		const roadmaps = await Roadmap.find({}).populate('steps');
		res.render('dashboard/roadmap/roadmapDashboard.ejs', {
			roadmaps,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.getCreateRoadmapDashboard = async (req, res) => {
	const roadmaps = await Roadmap.find({});

	res.render('dashboard/roadmap/addRoadmap.ejs', {
		title: null,
		roadmaps,
		description: null,
		summary: null,
		routeName: null,
		errorMassage: null,
		userLoggedIn: req.session.user,
	});
};
exports.validateRoadmap = [
	body('title', 'title must be at least 2 characters.')
		.isLength({ min: 2, max: 200 })
		.exists(),
	body('summary', 'summary must be at least 100 and less than 200 characters.')
		.isLength({ min: 2 })
		.exists(),
	body(
		'description',
		'description must be at least 100 and less than 200 characters'
	).isLength({ min: 50 }),
	body(
		'routeName',
		'routename  must be at least 2 less than 30 characters'
	).isLength({ min: 2, max: 30 }),
];
exports.postCreateRoadmapDashboard = async (req, res) => {
	const title = req.body.title;
	const summary = req.body.summary;
	const description = req.body.description;
	const routeName = req.body.routeName;
	const steps = req.body.steps;
	const errors = validationResult(req);
	const roadmaps = await Roadmap.find({});
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render('dashboard/roadmap/addRoadmap.ejs', {
			errorMassage: errors.array(),
			title: title,
			roadmaps,
			summary: summary,
			description: description,
			routeName: routeName,
			userLoggedIn: req.session.user,
		});
	}
	try {
		const roadmap = await new Roadmap();
		roadmap.title = title;
		roadmap.summary = summary;
		roadmap.description = description;
		roadmap.routeName = routeName;
		roadmap.steps = steps;
		roadmap.save();
		res.redirect('/admin/dashboard/roadmaps');
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.deleteRoadmap = async (req, res) => {
	const roadmapId = req.params.id;

	try {
		const roadmap = await Roadmap.findById(roadmapId);
		await roadmap.remove();
		res.status(200).json({ message: 'Success!' });
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
		res.status(500).json({ message: 'failed!' });
	}
};
exports.getEditRoadmapDashboard = async (req, res) => {
	const roadmaps = await Roadmap.find({});

	const roadmapId = req.params.id;
	try {
		const roadmap = await Roadmap.findById({ _id: roadmapId });
		res.render('dashboard/roadmap/roadmapEdit.ejs', {
			errorMassage: null,
			roadmap,
			roadmaps,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.postEditroadmapDashboard = async (req, res, next) => {
	const title = req.body.title;
	const summary = req.body.summary;
	const description = req.body.description;
	const routeName = req.body.routeName;
	const roadmapId = req.body.id;
	const roadmap = await Roadmap.findById({ _id: roadmapId });
	const roadmaps = await Roadmap.find({});
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render('dashboard/roadmap/roadmapEdit.ejs', {
			errorMassage: errors.array(),
			title: title,
			roadmaps,
			summary: summary,
			description: description,
			routeName: routeName,
			roadmap,
			userLoggedIn: req.session.user,
		});
	}
	try {
		const roadmap = await Roadmap.findById({ _id: roadmapId });
		roadmap.title = title;
		roadmap.summary = summary;
		roadmap.description = description;
		roadmap.routeName = routeName;
		roadmap.save();
		res.redirect('/admin/dashboard/roadmaps');
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

//================Topic dashboard======================

exports.getTopicDashboard = async (req, res) => {
	try {
		const roadmaps = await Roadmap.find({});
		const topics = await Topic.find({}).populate('roadmaps');
		res.render('dashboard/topic/topicDashboard.ejs', {
			topics,
			roadmaps,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.getRoadmapTopicsDashboard = async (req, res) => {
	const roadmaproute = req.params.roadmap;
	try {
		const roadmaps = await Roadmap.find();
		const roadmap = await Roadmap.findOne({ routeName: roadmaproute }).populate(
			'steps'
		);
		res.render('dashboard/topic/roadmapTopics.ejs', {
			roadmap,
			roadmaps,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.getCreateTopicDashboard = async (req, res) => {
	try {
		const roadmaps = await Roadmap.find({});
		res.render('dashboard/topic/addTopic.ejs', {
			errorMassage: null,
			title: null,
			summary: null,
			description: null,
			routeName: null,
			video: null,
			roadmaps,
			userLoggedIn: req.session.user,
		});
	} catch {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.validateTopic = [
	body('title', 'title must be at least 2 characters.')
		.isLength({ min: 2, max: 200 })
		.exists(),
	body('summary', 'summary must be less than 200 characters.').exists(),
	body(
		'description',
		'description must be at least 100 and less than 200 characters'
	),
	body(
		'routeName',
		'routename  must be at least 2 less than 30 characters'
	).isLength({ min: 2, max: 30 }),
];
exports.postCreateTopicDashboard = async (req, res) => {
	const title = req.body.title;
	const summary = req.body.summary;
	const description = req.body.description;
	const routeName = req.body.routeName;
	const video = req.body.video;

	let references;
	if (typeof req.body.references == 'object') {
		references = req.body.references;
	} else if (typeof req.body.references == 'string') {
		references = [req.body.references];
	} else {
		references = [];
	}

	let roadmaproute;
	if (typeof req.body.roadmaps == 'object') {
		roadmaproute = req.body.roadmaps;
	} else if (typeof req.body.roadmaps == 'string') {
		roadmaproute = [req.body.roadmaps];
	} else {
		roadmaproute = [];
	}
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const roadmaps = await Roadmap.find({});
		console.log(errors.array());
		return res.status(422).render('dashboard/topic/addTopic.ejs', {
			errorMassage: errors.array(),
			title: title,
			summary: summary,
			description: description,
			routeName: routeName,
			video: video,
			roadmaps,
			userLoggedIn: req.session.user,
		});
	}
	try {
		const topic = await new Topic();
		topic.title = title;
		topic.summary = summary;
		topic.description = description;
		topic.routeName = routeName;
		const ref = references.filter(ref => ref != '');
		topic.references = ref;
		if (video != '' && regex.test(video)) {
			console.log('success');
			topic.video = video;
		} else {
			console.log('fail');
		}
		for (var i = 0; i < roadmaproute.length; i++) {
			const roadmap = await Roadmap.findOne({ routeName: roadmaproute[i] });
			roadmap.steps.push(topic);
			await roadmap.save();
			topic.roadmaps.push(roadmap);
		}
		await topic.save();
		res.redirect('/admin/dashboard/topics');
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.deleteTopic = async (req, res) => {
	const TopicId = req.params.id;

	try {
		await Topic.findByIdAndDelete(TopicId);
		res.status(200).json({ message: 'Success!' });
	} catch (e) {
		res.status(500).json({ message: 'failed!' });
	}
};

exports.getEditTopicDashboard = async (req, res) => {
	const topicId = req.params.id;
	try {
		const topic = await Topic.findById({ _id: topicId }).populate('roadmaps');
		const roadmaps = await Roadmap.find({});
		references = topic.references;
		res.render('dashboard/topic/editTopic.ejs', {
			topic,
			errorMassage: null,
			roadmaps,
			references,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
exports.postEditTopicDashboard = async (req, res) => {
	const title = req.body.title;
	const summary = req.body.summary;
	const description = req.body.description;
	const routeName = req.body.routeName;
  let references;
	if (typeof req.body.references == 'object') {
		references = req.body.references;
	} else if (typeof req.body.references == 'string') {
		references = [req.body.references];
	} else {
		references = [];
	}
  console.log(references)
	const video = req.body.video;
	const topicId = req.body.id;
	let roadmaproute;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		let topic;
		let roadmaps;
		let referencess;
		try {
			topic = await Topic.findById({ _id: topicId }).populate('roadmaps');
			roadmaps = await Roadmap.find({});
			referencess = topic.references;
		} catch (e) {
			if (!e.statusCode) {
				e.statusCode = 500;
			}
			next(e);
		}
		console.log(errors.array());
		return res.status(422).render('dashboard/topic/editTopic.ejs', {
			errorMassage: errors.array(),
			topic,
			roadmaps,
			referencess,
			userLoggedIn: req.session.user,
		});
	}
	if (typeof req.body.roadmaps == 'object') {
		roadmaproute = req.body.roadmaps;
	} else if (typeof req.body.roadmaps == 'string') {
		roadmaproute = [req.body.roadmaps];
	} else {
		roadmaproute = [];
	}
	try {
		const topic = await Topic.findById({ _id: topicId }).populate('roadmaps');
		topic.title = title;
		topic.summary = summary;
		topic.description = description;
		topic.routeName = routeName;
    const ref = references.filter(ref => ref != '');
     topic.references = ref;
		if (video != '' && video.includes('https://')) {
			topic.video = video;
		}
		for (var i = 0; i < roadmaproute.length; i++) {
			const roadmap = await Roadmap.findOne({
				routeName: roadmaproute[i],
			}).populate('steps');
			if (!topic.roadmaps.some(road => road.title === roadmap.title)) {
				topic.roadmaps.push(roadmap);
			}
			if (!roadmap.steps.some(step => step.title === topic.title)) {
				roadmap.steps.push(topic);
				await roadmap.save();
			}
		}
		topic.save();
		res.redirect('/admin/dashboard/topics');
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

// exports.postEditTopicDashboard = async (req, res, next) => {
// 	const title = req.body.title;
// 	const summary = req.body.summary;
// 	const description = req.body.description;
// 	const routeName = req.body.routeName;
// 	let references = req.body.references;
// 	const video = req.body.video;
// 	const topicId = req.body.id;
// 	let roadmaproute;

// 	const errors = validationResult(req);
// 	if (!errors.isEmpty()) {
// 		let topic;
// 		let roadmaps;
// 		let references;
// 		try {
// 			topic = await Topic.findById({ _id: topicId }).populate('roadmaps');
// 			roadmaps = await Roadmap.find({});
// 			references = topic.references;
// 		} catch (e) {
// 			if (!e.statusCode) {
// 				e.statusCode = 500;
// 			}
// 			next(e);
// 		}
// 		console.log(errors.array());
// 		return res.status(422).render('dashboard/topic/editTopic.ejs', {
// 			errorMassage: errors.array(),
// 			topic,
// 			roadmaps,
// 			references,
// 			userLoggedIn: req.session.user,
// 		});
// 	}
// 	if (typeof req.body.roadmaps == 'object') {
// 		roadmaproute = req.body.roadmaps;
// 	} else if (typeof req.body.roadmaps == 'string') {
// 		roadmaproute = [req.body.roadmaps];
// 	} else {
// 		roadmaproute = [];
// 	}
// 	try {
// 		const topic = await Topic.findById({ _id: topicId }).populate('roadmaps');
// 		topic.title = title;
// 		topic.summary = summary;
// 		topic.description = description;
// 		topic.routeName = routeName;
// 		const ref = references.filter(ref => ref != '');
// 		topic.references = ref;
// 		if (video != '' && regex.test(video)) {
// 			topic.video = video;
// 		}
// 		for (var i = 0; i < roadmaproute.length; i++) {
// 			const roadmap = await Roadmap.findOne({
// 				routeName: roadmaproute[i],
// 			}).populate('steps');
// 			if (!topic.roadmaps.some(road => road.title === roadmap.title)) {
// 				topic.roadmaps.push(roadmap);
// 			}
// 			if (!roadmap.steps.some(step => step.title === topic.title)) {
// 				roadmap.steps.push(topic);
// 				await roadmap.save();
// 			}
		// }
// 		topic.save();
// 		res.redirect('/admin/dashboard/topics');
// 	} catch (e) {
// 		if (!e.statusCode) {
// 			e.statusCode = 500;
// 		}
// 		next(e);
// 	}
// };

exports.getFeedback = async (req, res, next) => {
	try {
		const feedbacks = await Feedback.find({});
		res.render('dashboard/feedback.ejs', {
			feedbacks,
			errorMassage: null,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.deleteFeedback = async (req, res, next) => {
	const feedbackId = req.params.id;
	try {
		await Feedback.findByIdAndDelete(feedbackId);
		res.status(200).json({ message: 'Success!' });
	} catch (e) {
		res.status(500).json({ message: 'failed!' });
	}
};
