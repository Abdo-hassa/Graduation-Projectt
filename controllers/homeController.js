const axios = require('axios');
const moment = require('moment');
const User = require('../models/User');
const Post = require('../models/Post');
const Roadmap = require('../models/Roadmap');
const Feedback = require('../models/Feedback');

const { renderUsers, generateCriteriaObject } = require('../middleware/helper');

exports.getHome = async (req, res, next) => {
	let userid;
	if (req.user) {
		userid = req.user._id.toString();
	} else {
		userid = null;
	}

	const roadmaps = await Roadmap.find({});
	res.render('home/index', { userid, roadmaps });
};

exports.getTimeline = async (req, res, next) => {
	const data = await axios.get('https://dev.to/api/articles');
	const news = data.data;
	let userid;
	if (req.user) {
		userid = req.user._id.toString();
	} else {
		userid = null;
	}
	try {
		res.render('home/timeline', {
			userid: userid,
			pageTitle: 'Timeline',
			news: news,
			user: req.session.user,
			postDetail: false,
			selectedTap: null,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.getExplore = async (req, res, next) => {
	const data = await axios.get('https://dev.to/api/articles');
	const news = data.data;
	let userid;
	if (req.user) {
		userid = req.user._id.toString();
	} else {
		userid = null;
	}
	res.render('home/explore', {
		pageTitle: 'Explore',
		userid: userid,
		news: news,
		userLoggedIn: req.session.user,
		postDetail: false,
		selectedTap: null,
	});
};

exports.getNews = async (req, res) => {
	const data = await axios.get(
		'https://dev.to/api/articles?per_page=100&tags=javascript, css, react, web, coding&top=5'
	);

	const news = data.data;
	res.render('news/news', {
		title: 'News',
		news: news,
		pageTitle: 'News',
		user: req.session.user,
	});
};

exports.getSearch = async (req, res) => {
	try {
		const roadmaps = await Roadmap.find({});
		res.render('search/final_search.ejs', {
			users: [],
			roadmaps,
			user: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.postSearch = async (req, res, next) => {
	let name, yearOfBirth, language, country, gender, skills, body;
	if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
		allData = req.body.allData;
	}
	allData = generateCriteriaObject(allData);
	try {
		const users = await User.find(allData, { password: 0 });
		const roadmaps = await Roadmap.find({});
		let matchedUsers;
		if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
			if (users.length !== 0) {
				matchedUsers = users.map(renderUsers).join('');
			} else {
				matchedUsers = '';
			}
			res.send({ users: matchedUsers });
		}
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.getSearchPosts = (req, res) => {
	res.render('search/searchPosts.ejs', {
		modifiedPosts: '',
		posts: [],
		moment,
		query: '',
		user: req.session.user,
		selectedTap: null,
	});
};

exports.postSearchPosts = async (req, res) => {
	const { query } = req.body;
	const { skip, limit } = req.query;
	try {
		const page = +req.query.page || '1';
		const allPosts = await Post.aggregate([
			{
				$match: {
					$or: [
						{
							description: {
								$regex: query,
								$options: 'i',
							},
						},
						{
							hashtags: {
								$regex: query,
								$options: 'i',
							},
						},
						{
							hashtag: {
								$in: [query],
							},
						},
					],
				},
			},
		])
			.sort({ createdAt: -1 })
			.skip(Number(skip))
			.limit(Number(limit));
		const numPosts = await Post.find().countDocuments();
		totalItems = numPosts;
		const posts = await Post.populate(allPosts, { path: 'user' });
		return res.send({ posts });
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.getUsers = async (req, res) => {
	var searchObj = req.query;

	if (req.query.search !== undefined) {
		searchObj = {
			$or: [
				{ name: { $regex: req.query.search, $options: 'i' } },
				{ username: { $regex: req.query.search, $options: 'i' } },
			],
		};
	}
	User.find(searchObj)
		.then(results => {
			res.status(200).send(results);
		})
		.catch(e => {
			if (!e.statusCode) {
				e.statusCode = 500;
			}
			next(e);
		});
};

exports.postFeedback = async (req, res) => {
	const data = req.body;
	try {
		let newfeedback = await Feedback.create(data);
		newfeedback.save();
		return res.status(201).send({ newfeedback });
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.getSimilars = async (req, res, next) => {
	const userLoggedIn = req.session.user;
	try {
		const similarUsers = await User.find({
			$and: [
				{
					skills: {
						$in: userLoggedIn.skills,
					},
				},
				{
					_id: { $ne: userLoggedIn._id },
				},
				{
					followers: { $nin: userLoggedIn._id },
				},
			],
		});
		res.send(similarUsers);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		return next(e);
	}
};
