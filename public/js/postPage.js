let userId;
$(document).ready(function () {
	console.log(window.location.pathname);
	if (postId) {
		$.get('/posts/' + postId, results => {
			let post = results.post;
			userId = results.userId;
			outputPostsWithReplies(results, $('.postContent'));
		});
	}
});
