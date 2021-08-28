const User = require('../models/User');
const Post = require('../models/Post');
const moment = require('moment');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const Roadmap = require('../models/Roadmap');
const Notification = require('../models/Notification');

exports.getUserProfile = async (req, res, next) => {
	const username = req.params.username;
	let userRepos = [];
	let isFollowing;

	try {
		const userDoc = await User.findOne({ username: username }).populate(
			'bookmarks'
		);
		if (userDoc === null) {
			res.locals.error = 'this user is deleted recently';
			const error = new Error(
				'This account is not found. It may be deleted recently.'
			);
			error.statusCode = 422;
			return next(error);
		}
		if (
			userDoc?.followers &&
			userDoc.followers.includes(req.session.user._id)
		) {
			isFollowing = true;
		}
		userId = userDoc._id;
		const posts = await Post.find({ user: userId })
			.sort({ createdAt: 'desc' })
			.populate('user')
			.populate('replyTo');
		let commentCount = 0;
		posts.forEach(post => {
			if (post.replyTo) {
				commentCount += 1;
			}
		});

		// fetch first five repose from user's github account to show them in projects section
		const postsCount = posts.length-commentCount;
		if (userDoc.websites.length > 0 && userDoc.websites[0].includes('github')) {
			let userGithubUrl = userDoc.websites[0];
			const lastIndexOfBackSlash = userGithubUrl.lastIndexOf('/');
			// substract username after the last backslash and to the last index of the string
			const githubUsername = userGithubUrl.substring(
				lastIndexOfBackSlash + 1,
				userGithubUrl[-1]
			);
			const response = await axios.get(
				`https://api.github.com/users/${githubUsername}/repos`
			);
			const repos = response.data;

			//! this block can be better by returning after pushing 5 elements and not iterating through the whole object data
			repos.forEach((repo, index) => {
				if (repo.fork !== true && userRepos.length < 5) {
					userRepos.push({ repoName: repo.name, repoUrl: repo.html_url });
				}
			});

			// for (let i = 0; i < repos.length; i++) {
			// 	if (repos[i].fork !== true && userRepos.length < 5) {
			// 		userRepos.push({
			// 			repoName: repos[i].name,
			// 			repoUrl: repos[i].html_url,
			// 		});
			// 	} else {
			// 		break;
			// 	}
			// }
		}

		res.render('profile/user-profile', {
			user: userDoc,
			userId: userId,
			username: username,
			posts,
			moment,
			commentCount,
			userRepos,
			postsCount,
			isFollowing,
			selectedTap: req.query.comments ? 'comments' : '',
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.getUpdateProfile = async (req, res) => {
	let userid = req.user._id || null;

	let websites = req.user.websites;
	let userDoc;
	try {
		userDoc = await User.findOne({ _id: req.session.user._id });
	} catch (e) {
		console.log(e);
	}

	let websitesObj = {};

	// convert the array of websites to object of all websites
	for (const link of websites) {
		if (link.includes('github')) {
			websitesObj['github'] = link;
		} else if (link.includes('instagram')) {
			websitesObj['instagram'] = link;
		} else if (link.includes('twitter')) {
			websitesObj['twitter'] = link;
		} else if (link.includes('stackoverflow')) {
			websitesObj['stackoverflow'] = link;
		} else if (link.includes('linkedin')) {
			websitesObj['linkedin'] = link;
		}
	}
	try {
		const roadmaps = await Roadmap.find({});
		res.render('profile/edit-profile', {
			userid: userid,
			websitesObj,
			errorMassage: null,
			roadmaps,
			name: userDoc.name,
			userLoggedIn: req.session.user,
		});
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

exports.validateProfile = [
	body('name', 'Name must be at least 4 characters in text or numbers only.')
		.exists()
		.isLength({ min: 4 }),
	body('bio', 'bio must be less than 120 characters').isLength({ max: 120 }),
];

exports.postUpdateProfile = async (req, res, next) => {
	let {
		userid,
		username,
		name,
		bio,
		country,
		date_of_birth: BirthDate,
		gender,
		skills,
		language: nativeLang,
		github,
		linkedin,
		instagram,
		twitter,
		stackoverflow,
	} = req.body;

	if (skills) {
		if (typeof skills === 'string') {
			skills = [skills];
		}
	}
	let image;
	let Image;
	image = req.file;

	if (image !== undefined) {
		Image = image.path;
	}
	//Validaton block ===============================
	let websites = req.user.websites;
	let websitesObj = {};
	// convert the array of websites to object of all websites
	for (const link of websites) {
		if (link.includes('github')) {
			websitesObj['github'] = link;
		} else if (link.includes('instagram')) {
			websitesObj['instagram'] = link;
		} else if (link.includes('twitter')) {
			websitesObj['twitter'] = link;
		} else if (link.includes('stackoverflow')) {
			websitesObj['stackoverflow'] = link;
		} else if (link.includes('linkedin')) {
			websitesObj['linkedin'] = link;
		}
	}
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		let roadmaps;
		try {
			roadmaps = await Roadmap.find({});
		} catch (e) {
			console.log(e);
		}
		console.log(errors.array());
		return res.status(422).render('profile/edit-profile', {
			errorMassage: errors.array(),
			name,
			userid: userid,
			websitesObj,
			roadmaps,
		});
	}
	try {
		const user = await User.findOne({ _id: userid });
		user.name = name;
		if (bio !== '') {
			user.bio = bio;
		}
		if (country !== '') {
			user.country = country;
		}
		if (BirthDate !== '') {
			user.yearOfBirth = BirthDate;
		}
		user.gender = gender;
		if (skills !== undefined) {
			user.skills = skills;
		} else {
			user.skills = [];
		}
		if (nativeLang !== '') {
			user.nativeLang = nativeLang;
		}

		if (image !== undefined) {
			user.Image = Image;
		}
		//* if github url is provided it will always be first element in my array that's why im checking it there in my profile controller above
		let websites = [github, linkedin, stackoverflow, twitter, instagram];

		if (
			github === '' ||
			linkedin === '' ||
			stackoverflow === '' ||
			twitter === '' ||
			instagram === ''
		) {
			// pop them from the websites array
			websites = websites.filter(link => link !== '');
		}
		user.websites = websites;
		user.save();
		req.session.user = user;
		await req.session.save(e => {
			console.log(e);
		});
		res.redirect('/users/profile/' + username);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

// PUT /users/:userId/follow
exports.postFollow = async (req, res) => {
	const userId = req.params.userId;

	const user = await User.findById(userId);
	if (!user) return res.sendStatus(404);

	let isFollowing =
		user.followers && user.followers.includes(req.session.user._id);
	let option = isFollowing ? '$pull' : '$addToSet';

	req.session.user = await User.findByIdAndUpdate(
		req.session.user._id,
		{
			[option]: { following: userId },
		},
		{ new: true }
	).catch(error => {
		console.log(error);
		res.sendStatus(400);
	});

	User.findByIdAndUpdate(userId, {
		[option]: { followers: req.session.user._id },
	}).catch(error => {
		console.log(error);
		res.sendStatus(400);
	});
	try {
		if (!isFollowing) {
			await Notification.insertNotification(
				userId,
				req.session.user._id,
				'follow',
				req.session.user.username
			);
		}
		res.status(200).send(req.session.user);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};

// users/:username:/followers
exports.getFollowers = async (req, res) => {
	try {
		var payload = await getPayload(req.params.username, req.session.user);
		payload.selectedTab = 'followers';
		res.status(200).render('profile/followersAndFollowing', payload);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
// users/:username:/following
exports.getFollowing = async (req, res) => {
	try {
		var payload = await getPayload(req.params.username, req.session.user);
		payload.selectedTab = 'following';

		res.status(200).render('profile/followersAndFollowing', payload);
	} catch (e) {
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		next(e);
	}
};
// users/:userId:/followers
exports.getFollowersData = async (req, res) => {
	User.findById(req.params.userId)
		.populate('followers')
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

// users/:userId/following
exports.getFollowingData = async (req, res) => {
	User.findById(req.params.userId)
		.populate('following')
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

async function getPayload(username, userLoggedIn) {
	var user = await User.findOne({ username: username });

	if (user == null) {
		user = await User.findById(username);

		if (user == null) {
			return {
				pageTitle: 'User not found',
				userLoggedIn: userLoggedIn,
				userLoggedInJs: JSON.stringify(userLoggedIn),
			};
		}
	}

	return {
		pageTitle: user.username,
		userLoggedIn: userLoggedIn,
		userLoggedInJs: JSON.stringify(userLoggedIn),
		profileUser: user,
		profileUserId: user._id,
	};
}
