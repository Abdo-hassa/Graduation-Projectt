const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const findHashtags = require('find-hashtags');
const Roadmap = require('../models/Roadmap');

//! no longer being used
// /posts/:id/details
exports.getEdit = async (req, res, next) => {
	// if there's timeline query in the request let timeline = true else False
	console.log('in edit post');
	let timeline = req.query.timeline || false;
	const postId = req.params.id;
	let userid = req.user._id || null;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			return next(new Error('Post not found.'));
		}
		const roadmaps = await Roadmap.find({});
		res.send(post);
		// res.render('post/edit-post', {
		// 	post,
		// 	userid,
		// 	timeline,
		// 	roadmaps,
		// 	userLoggedIn: req.session.user,
		// });
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

// /posts/:id/edit
exports.postEdit = async (req, res, next) => {
	const postId = req.params.id;
	const description = req.body.data;

	try {
		await Post.findByIdAndUpdate(postId, {
			description: description,
			hashtags: findHashtags(description),
		});
		return res.sendStatus(200);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

// DELETE /posts/:id
exports.deletePost = async (req, res) => {
	const postId = req.params.id;
	try {
		const post = await Post.findByIdAndDelete(postId);
		if (!post) {
			const error = new Error('no post found with this id');
			throw error;
		}
		await post.remove();
		res.sendStatus(202);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

// Create
// localhost:3000/posts?timeline=true
exports.createPost = async (req, res) => {
	const { post } = req.body;
	const replyTo = req.body.replyTo;

	let userId = req.session.user._id;

	const data = {
		user: req.session.user,
		description: post.trim(),
		hashtags: findHashtags(post),
	};

	if (req.body.replyTo) {
		data.replyTo = req.body.replyTo;
		// update post comments number
		try {
			await Post.findOneAndUpdate({ _id: replyTo }, { $inc: { replies: 1 } });
		} catch (e) {
			console.log(e);
		}
	}

	try {
		let newPost = await Post.create(data);
		newPost = await User.populate(newPost, { path: 'user' });
		newPost = await Post.populate(newPost, { path: 'replyTo' });
		if (
			newPost.replyTo !== undefined &&
			newPost.replyTo.user.toString() !== req.session.user._id.toString()
		) {
			await Notification.insertNotification(
				newPost.replyTo.user,
				req.session.user._id,
				'reply',
				newPost._id
			);
		}
		return res.status(201).send({ newPost, userId });
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.getPosts = async (req, res) => {
	const { skip } = req.query;
	const { limit } = req.query;
	let { profileUser } = req.query;

	delete req.query.skip;
	delete req.query.limit;
	delete req.query.user;

	let searchObj = req.query;
	searchObj.user = profileUser || null;
	!searchObj.user && delete searchObj.user;
	delete searchObj.profileUser;
	console.log(searchObj);

	let userId = req.session.user._id;

	// b-filter kol el posts elli feha field replyTo 3shan ana 3ayz el posts bs msh el comments
	if (searchObj.isReply !== undefined) {
		let isReply = searchObj.isReply == 'true';
		searchObj.replyTo = { $exists: isReply };
		delete searchObj.isReply;
	}

	if (searchObj.followingOnly !== undefined) {
		let followingOnly = searchObj.followingOnly == 'true';

		if (followingOnly) {
			let objectsIds = req.session.user.following;

			objectsIds.push(req.session.user._id);

			searchObj.user = { $in: objectsIds };
		}
		delete searchObj.followingOnly;
	}

	var posts = await getPosts(searchObj, Number(skip), Number(limit));
	return res.status(200).send({ posts, userId });
};

// !
// PUT /posts/:id/like
exports.postLike = async (req, res) => {
	var postId = req.params.id;
	var userId = req.session.user._id;

	var isLiked = req.user.likes.length > 0 && req.user.likes.includes(postId);

	var option = isLiked ? '$pull' : '$addToSet';

	// Insert user like
	req.session.user = await User.findByIdAndUpdate(
		userId,
		{
			[option]: { likes: postId },
		},
		{ new: true }
	).catch(error => {
		if (!e.statusCode) {
			e.statusCode = 400;
		}
		next(e);
	});

	// Insert post like
	var post = await Post.findByIdAndUpdate(
		postId,
		{
			[option]: { likes: userId },
		},
		{ new: true }
	).catch(error => {
		if (!e.statusCode) {
			e.statusCode = 400;
		}
		next(e);
	});

	if (!isLiked && post.user.toString() !== userId.toString()) {
		await Notification.insertNotification(
			post.user,
			userId,
			'postLike',
			post._id
		);
	}

	res.status(200).send(post);
};

// GET posts/:id
exports.getPost = async (req, res, next) => {
	var userId = req.session.user._id;
	var post = await getPosts({ _id: req.params.id });
	if (post) {
		post = post[0];
	}

	if (!post) {
		const error = new Error('This post is not found');
		error.statusCode = 404;
		return next(error);
	}

	let results = {
		post,
		postId: req.params.id,
		userId,
		user: req.session.user,
		postDetail: true,
	};

	if (post.replyTo !== undefined) {
		results.replyTo = post.replyTo;
	}

	results.replies = await getPosts({ replyTo: req.params.id });

	return res.status(200).send(results);
};

// /posts/:id/details
exports.getPostDetails = async (req, res, next) => {
	var userId = req.session.user._id;
	const isValidId = mongoose.isValidObjectId(req.params.id);

	if (!isValidId) {
		const error = new Error('not a valid id syntax.');
		return next(error);
	}
	Post.findById(req.params.id)
		.then(post => {
			if (!post) {
				throw new Error('This post may be deleted recently by its owner.');
			}
			let payload = {
				postId: req.params.id,
				userId,
				user: req.session.user,
				selectedTap: null,
			};

			return res.status(200).render('post/post-details.ejs', payload);
		})
		.catch(error => {
			error.statusCode = 404;
			return next(error);
		});
};

async function getPosts(criteria, skip = 0, limit = 0) {
	try {
		let results = await Post.find(criteria)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate('user')
			.populate('replyTo');

		return await User.populate(results, { path: 'replyTo.user' });
	} catch (e) {
		console.log(e);
	}
}

// GET /users/likers/:postId
exports.getPostLikers = async (req, res, next) => {
	const postId = req.params.postId;
	try {
		const likers = await Post.findById(postId).populate('likes');
		console.log(likers.likes);
		return res.status(200).send(likers.likes);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
