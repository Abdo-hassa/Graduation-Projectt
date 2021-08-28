const router = require('express').Router();

const { getNotifications } = require('../controllers/notificationsController');
const { isAuthenticated } = require('../middleware/isAuthenticated');

router.get('/', isAuthenticated, getNotifications);

module.exports = router;
