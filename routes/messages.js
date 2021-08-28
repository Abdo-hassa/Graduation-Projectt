// ============ Node-Packages ============

const router = require('express').Router();

const {
	getMessages,
	newMessage,
	getChatPage,
} = require('../controllers/messagesController');
const { isAuthenticated } = require('../middleware/isAuthenticated');

router.get('/', isAuthenticated, getMessages);
router.get('/new', isAuthenticated, newMessage);
router.get('/:chatId', isAuthenticated, getChatPage);

module.exports = router;
