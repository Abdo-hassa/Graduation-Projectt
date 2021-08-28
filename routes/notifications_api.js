// ============ Node-Packages ============
const router = require('express').Router();

const {
	getNotifications,
	markAsOpened,
	markManyAsOpened,
	getLatestNotification,
} = require('../controllers/notificationsApiController');
const { isAuthenticated } = require('../middleware/isAuthenticated');

router.get('/', getNotifications);
router.get('/latest', getLatestNotification);
router.put('/:id/markAsOpened', markAsOpened);
router.put('/markAsOpened', markManyAsOpened);

module.exports = router;
