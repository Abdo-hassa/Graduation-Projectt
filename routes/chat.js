// ============ Node-Packages ============
const router = require('express').Router();

const {
	createChat,
	getChat,
	updateChatName,
	getSingleChat,
	getSingleChatMessages,
	markMessagesAsRead,
} = require('../controllers/chatController');
const { isAuthenticated } = require('../middleware/isAuthenticated');

router.post('/', isAuthenticated, createChat);
router.get('/', isAuthenticated, getChat);
router.put('/:chatId', isAuthenticated, updateChatName);
router.get('/:chatId', isAuthenticated, getSingleChat);
router.get('/:chatId/messages', isAuthenticated, getSingleChatMessages);
router.put('/:chatId/messages/markAsRead', isAuthenticated, markMessagesAsRead);

module.exports = router;
