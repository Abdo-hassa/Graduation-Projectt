const express = require('express');
const bodyparser = require('body-parser');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const morgan = require('morgan');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');

require('./utils/db');

const { findUser } = require('./middleware/helper');

const homeRoutes = require('./routes/home');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const adminRoutes = require('./routes/admin');
const roadmapsRoutes = require('./routes/roadmap');
const messagesRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chat');
const chatMessageRoutes = require('./routes/chatMessages');
const notificationsRoutes = require('./routes/notifications');
const notificationsApiRoutes = require('./routes/notifications_api');

const MongoDB_URI = 'mongodb://localhost:27017/zerotoone';
const app = express();
const server = app.listen(3000);
const io = require('socket.io')(server, { pingTimeout: 60000 });

app.set('view engine', 'ejs');

const store = new MongoDBStore({
	uri: MongoDB_URI,
	collection: 'sessions',
});

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/gif'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(morgan('tiny'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
	session({
		secret: 'my secret',
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

app.use(findUser);
app.use(flash());
app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedin;
	next();
});

// ============ Routes ============
app.use(homeRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/roadmaps', roadmapsRoutes);
app.use('/messages', messagesRoutes);
app.use('/chats', chatRoutes);
app.use('/chatMessage', chatMessageRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/api/notifications', notificationsApiRoutes);

app.use((req, res) => {
	if (!res.locals.error) {
		res.locals.error = 'This page is not found 😔\n';
	}
	// res.locals.message = 'Please check your URL or return to your previous page.';
	res.render('404.ejs', {
		userLoggedIn: req.session.user,
	});
});

// handling different errors
app.use((error, req, res, next) => {
	console.log(error.message);
	if (!error.message) {
		error.message = 'Page Not Found';
	}
	res.render('404.ejs', {
		userLoggedIn: req.session.user,
		error: error.message,
		title: 'Error',
	});
});

io.on('connection', socket => {
	socket.on('setup', userData => {
		socket.join(userData._id);
		socket.emit('connected');
	});

	socket.on('join room', room => socket.join(room));
	socket.on('typing', chatId => socket.in(chatId).emit('typing'));
	socket.on('stop typing', room => socket.in(room).emit('stop typing'));
	socket.on('notification received', room =>
		socket.in(room).emit('notification received')
	);

	socket.on('new message', newMessage => {
		var chat = newMessage.chat;
		if (!chat.users) return console.log('Chat.users not defined');

		chat.users.forEach(user => {
			if (user._id === newMessage.sender._id) return;
			socket.in(user._id).emit('message received', newMessage);
		});
	});
});
