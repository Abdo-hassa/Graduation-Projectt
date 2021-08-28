const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { check, body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const uuid = require('uuid');

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key:
				'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',
		},
	})
);

//get register page
// auth/register?redirectTo=roadmaps/webdev
exports.getRegister = (req, res, next) => {
	let redirectTo = req.body.redirectTo;
	res.render('auth/registerr', {
		pageTitle: 'Registeration',
		errorMassage: null,
		oldInput: {
			email: '',
			password: '',
			confirmPassword: '',
		},
		validationErrors: [],
		redirectTo: redirectTo || '',
	});
};

exports.validateRegister = [
	body('name', 'Name must be at least 4 characters in text or numbers only.')
		.exists()
		.isLength({ min: 4 })
		.trim()
		.custom((value, { req }) => {
			return User.findOne({ name: value }).then(userDoc => {
				if (userDoc) {
					return Promise.reject('Name is already taken.');
				}
			});
		}),
	check('email')
		.isEmail()
		.withMessage('This email is not valid!')
		.custom((value, { req }) => {
			return User.findOne({ email: value }).then(userDoc => {
				if (userDoc) {
					return Promise.reject('Email is already exist.');
				}
			});
		})
		.normalizeEmail(),
	body(
		'password',
		'Please enter a password with only numbers, text and at least 5 characters.'
	)
		.isLength({ min: 5 })
		.isAlphanumeric()
		.trim(),
	body('confirmPassword')
		.trim()
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Passwords have to match!');
			}
			return true;
		}),
];

let id;
let username;
async function ensureUsernameUniqueness(name) {
	// generate random usernames
	let user;
	do {
		id = uuid.v4();
		username = name.split(' ').join('') + id.slice(0, 3);
		user = await User.findOne({ username });
	} while (user !== null);
	return username;
}

//post Register
exports.postRegister = async (req, res, next) => {
	const email = req.body.email;
	const name = req.body.name;
	const password = req.body.password;
	const redirectTo = req.body.redirectTo || '';

	// ensure of username uniqueness
	username = await ensureUsernameUniqueness(name);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/registerr', {
			path: '/register',
			pageTitle: 'Register',
			// for displaying the red messages
			errorMassage: errors.array()[0].msg,
			oldInput: {
				name,
				email: email,
				password: password,
				confirmPassword: req.body.confirmPassword,
			},
			// for displaying the red border in error's fields
			validationErrors: errors.array(),
			redirectTo,
		});
	}
	try {
		let user = await User.findOne({ email: email });
		// save the default image for the newly created user
		let Image = 'assets/img/default.png';
		// if there's no user
		const hashedpass = await bcrypt.hash(password, 12);
		user = new User({
			name,
			email: email,
			password: hashedpass,
			username,
			Image,
		});

		user.save();
		if (redirectTo) {
			res.redirect(`/auth/login?redirectTo=${redirectTo}`);
		} else {
			res.redirect(`/auth/login`);
		}

		transporter.sendMail({
			to: email,
			from: 'abdallahhassann1998@gmail.com',
			subject: 'Signup succeeded !',
			html: '<h1> You successfully signed up<h1>',
		});
	} catch (e) {
		console.log(e);
	}
};

//Get login page
// /auth/users?redirectTo=/roadmaps/ai
exports.getLogin = (req, res, next) => {
	let redirectTo = req.query.redirectTo;

	// const query = req.query.index || null;
	res.render('auth/loginn', {
		pageTitle: 'Login',
		errorMassage: null,
		oldInput: {
			email: '',
			password: '',
		},
		validationErrors: [],
		redirectTo,
	});
};

exports.validateLogin = [
	check('email')
		.isEmail()
		.withMessage('Please enter a valid email address.')
		.normalizeEmail()
		.custom((value, { req }) => {
			//async validation (we wating for date )
			return User.findOne({ email: value }).then(userDoc => {
				if (!userDoc) {
					return Promise.reject(
						'E-mail does not exist, please write a correct one.'
					);
				}
			});
		}),
	body('password', 'Password has to be valid.')
		.isLength({ min: 5 })
		.isAlphanumeric()
		.trim(),
];

//Post Login
exports.postlogin = async (req, res, next) => {
	let redirectTo = req.body.redirectTo || req.query.redirectTo;
	const email = req.body.email;
	const password = req.body.password;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/loginn', {
			path: '/login',
			pageTitle: 'Login',
			errorMassage: errors.array()[0].msg,
			oldInput: {
				email: email,
				password: password,
			},
			validationErrors: errors.array(),
			redirectTo,
		});
	}
	try {
		const user = await User.findOne({ email: email });

		const doMatch = await bcrypt.compare(password, user.password);

		if (doMatch) {
			req.session.user = user.hidePrivateData();
			req.session.isLoggedin = true;
			if (user.role) {
				req.session.isAdmin = true;
			}
			return req.session.save(err => {
				if (err) {
					console.log(err);
				}
				if (redirectTo) {
					res.redirect(redirectTo);
				} else {
					res.redirect('/timeline');
				}
			});
		}
		res.status(422).render('auth/loginn', {
			path: '/login',
			pageTitle: 'Login',
			errorMassage: "Password don't match!",
			oldInput: {
				email: email,
				password: password,
			},
			validationErrors: [{ param: 'notMatched' }],
			redirectTo: '',
		});
	} catch (e) {
		console.log(e);
	}
};

//Post logout page
exports.getLogout = (req, res, next) => {
	req.session.destroy(err => {
		console.log(err);
		res.redirect('/');
	});
};

//get Reset
exports.getReset = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/resett', {
		path: '/reset',
		pageTitle: 'Reset Password',
		errorMassage: message,
	});
};

//Post Reset
exports.postReset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			if (!e.statusCode) {
				e.statusCode = 500;
			}
			next(e);
			return res.redirect('/auth/reset');
		}
		const token = buffer.toString('hex');
		User.findOne({ email: req.body.email })
			.then(user => {
				if (!user) {
					req.flash('error', 'No account with that email found.');
					res.redirect('/auth/reset');
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600000;
				return user.save();
			})
			.then(result => {
				res.redirect('/');
				transporter.sendMail({
					to: req.body.email,
					from: 'abdallahhassann1998@gmail.com',
					subject: 'Password reset',
					html: `
			<p>You requested a password reset.</p>
			<p> Click this <a href ="http://localhost:3000/auth/reset/${token}" > link </a>to set a new password.</p>
			`,
				});
			})
			.catch(err => {
				console.log(err);
			});
	});
};

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;
	User.findOne({
		resetToken: token,
		resetTokenExpiration: { $gt: Date.now() },
	})
		.then(user => {
			let message = req.flash('error');
			if (message.length > 0) {
				message = message[0];
			} else {
				message = null;
			}
			res.render('auth/new-passwordd', {
				path: '/new-password',
				pageTitle: 'New Password',
				errorMessage: message,
				userId: user._id.toString(),
				passwordToken: token,
			});
		})
		.catch(err => {
			console.log(err);
		});
};

exports.postNewPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const passwordToken = req.body.passwordToken;
	let resetUser;
	User.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId,
	})
		.then(user => {
			resetUser = user;
			return bcrypt.hash(newPassword, 12);
		})
		.then(hashedpassword => {
			resetUser.password = hashedpassword;
			resetUser.resetToken = undefined;
			resetUser.resetTokenExpiration = undefined;
			return resetUser.save();
		})
		.then(result => {
			res.redirect('/auth/login');
			return transporter.sendMail({
				to: resetUser.email,
				from: 'abdallahhassann1998@gmail.com',
				subject: 'Reset Password succeeded !',
				html: '<h1> You successfully reset your password<h1>',
			});
		})
		.catch(err => {
			console.log(err);
		});
};
