const router = require('express').Router();
const { createMessage } = require('../controllers/chatMessageController');
const { isAuthenticated } = require('../middleware/isAuthenticated');

router.post('/', isAuthenticated, createMessage);

module.exports = router;
