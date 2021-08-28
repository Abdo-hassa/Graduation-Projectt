// ============ Node-Packages ============
const router = require('express').Router();

// ============ My-Modules ============
const {
	getEdit,
	getPost,
	createPost,
	postEdit,
	deletePost,
	getPosts,
	postLike,
	getPostDetails,
	getPostLikers,
} = require('../controllers/postController');

router.get('/:id', getPost);
router.delete('/:id', deletePost);
router.get('/:id/details', getPostDetails);
router.put('/:id/like', postLike);
router.get('/:id/edit', getEdit);
router.post('/:id/edit', postEdit);
router.post('/', createPost);
router.get('/', getPosts);
router.get('/likers/:postId', getPostLikers);
// router.post('/:id/delete', deletePost);

module.exports = router;
