const router = require('express').Router();
const { isAdmin } = require('../middleware/isAuthenticated');
const { isAuthenticated } = require('../middleware/isAuthenticated');

const {
	getDashboard,
	getUserDashboard,
	getEditUserDashboard,
	deleteUser,
	validateUser,
	postEditUserDashboard,
	getPostDashboard,
	deletePost,
	getEditPostDashboard,
	postEditPostDashboard,
	getRoadmapDashboard,
	getCreateRoadmapDashboard,
	validateRoadmap,
	postCreateRoadmapDashboard,
	deleteRoadmap,
	getEditRoadmapDashboard,
	postEditroadmapDashboard,
	getTopicDashboard,
	getCreateTopicDashboard,
	validateTopic,
	postCreateTopicDashboard,
	deleteTopic,
	getEditTopicDashboard,
	postEditTopicDashboard,
	getRoadmapTopicsDashboard,
	getFeedback,
	deleteFeedback,
} = require('../controllers/adminController');

router.get('/dashboard', isAuthenticated, isAdmin, getDashboard);
// =====================USer Dashboard========================

router.get('/dashboard/users', isAuthenticated, isAdmin, getUserDashboard);
router.get(
	'/dashboard/users/edit/:id',
	isAuthenticated,
	isAdmin,
	getEditUserDashboard
);
router.delete('/dashboard/users/delete/:id', deleteUser);
router.post('/dashboard/users/edit', validateUser, postEditUserDashboard);

// =====================Post Dashboard========================

router.get('/dashboard/posts', isAuthenticated, isAdmin, getPostDashboard);
router.delete('/dashboard/posts/delete/:id', deletePost);
router.get(
	'/dashboard/posts/edit/:id',
	isAuthenticated,
	isAdmin,
	getEditPostDashboard
);
router.post('/dashboard/posts/edit', postEditPostDashboard);

// =====================Roadmap Dashboard========================

router.get(
	'/dashboard/roadmaps',
	isAuthenticated,
	isAdmin,
	getRoadmapDashboard
);
router.get(
	'/dashboard/roadmaps/create',
	isAuthenticated,
	isAdmin,
	getCreateRoadmapDashboard
);
router.post(
	'/dashboard/roadmaps/create',
	validateRoadmap,
	postCreateRoadmapDashboard
);
router.delete('/dashboard/roadmaps/delete/:id', deleteRoadmap);
router.get(
	'/dashboard/roadmaps/edit/:id',
	isAuthenticated,
	isAdmin,
	getEditRoadmapDashboard
);
router.post(
	'/dashboard/roadmaps/edit',
	validateRoadmap,
	postEditroadmapDashboard
);

// =====================Topic Dashboard========================
router.get('/dashboard/topics', isAuthenticated, isAdmin, getTopicDashboard);
router.get(
	'/dashboard/topics/create',
	isAuthenticated,
	isAdmin,
	getCreateTopicDashboard
);
router.post(
	'/dashboard/topics/create',
	validateTopic,
	postCreateTopicDashboard
);
router.delete('/dashboard/topics/delete/:id', deleteTopic);
router.get(
	'/dashboard/topics/edit/:id',
	isAuthenticated,
	isAdmin,
	getEditTopicDashboard
);
router.post('/dashboard/topics/edit', validateTopic, postEditTopicDashboard);
router.get(
	'/dashboard/topics/:roadmap',
	isAuthenticated,
	isAdmin,
	getRoadmapTopicsDashboard
);

// =====================Feedback Dashboard========================

router.get('/dashboard/feedback', isAuthenticated, isAdmin, getFeedback);
router.delete('/dashboard/feedback/delete/:id', deleteFeedback);

module.exports = router;
