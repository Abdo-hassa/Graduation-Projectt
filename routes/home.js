// ============ Node-Packages ============
const router = require('express').Router();

const {
	getHome,
	getRoadmaps,
	getNews,
	getTimeline,
	getSearch,
	getSearchPosts,
	postSearchPosts,
	postSearch,
	getHtml,
	getCss,
	getExplore,
	postFeedback,
	getSimilars,
} = require('../controllers/homeController');
const { isAuthenticated } = require('../middleware/isAuthenticated');

router.get('/', getHome);
router.get('/similars', getSimilars);
router.get('/timeline', isAuthenticated, getTimeline);
router.get('/explore', isAuthenticated, getExplore);
router.get('/news', isAuthenticated, getNews);
router.get('/search', isAuthenticated, getSearch);
router.get('/search/posts', isAuthenticated, getSearchPosts);
router.post('/search/posts', isAuthenticated, postSearchPosts);
router.post('/search/users', isAuthenticated, postSearch);
router.post('/feedback', postFeedback);

module.exports = router;
