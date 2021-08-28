const router = require('express').Router();

const {
	createRoadmap,
	getRoadmap,
	getRoadmaps,
	gettopic,
	postBookmark,
} = require('../controllers/roadmapscontroller');
const { isAuthenticated } = require('../middleware/isAuthenticated');

router.get('/', getRoadmaps);
router.post('/createe', createRoadmap);
router.get('/:roadmap', isAuthenticated, getRoadmap);
router.get('/:roadmap/:topic', gettopic); // !need to be /roadmaps/:roadmap/:topic
router.post('/bookmark', postBookmark);

module.exports = router;
