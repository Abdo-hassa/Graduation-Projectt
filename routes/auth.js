// ============ Node-Packages============
const router = require('express').Router();
const User = require('../models/User');

const {
	getRegister,
	getLogin,
	getNewPassword,
	getReset,
	getLogout,
	postlogin,
	postNewPassword,
	postReset,
	postRegister,
	validateRegister,
	validateLogin,
} = require('../controllers/authController');

router.get('/register', getRegister);
router.post('/register', validateRegister, postRegister);
router.get('/login', getLogin);
router.post('/login', validateLogin, postlogin);
router.get('/logout', getLogout);
router.get('/reset', getReset);
router.post('/reset', postReset);
router.get('/reset/:token', getNewPassword);
router.post('/new-password', postNewPassword);

module.exports = router;
