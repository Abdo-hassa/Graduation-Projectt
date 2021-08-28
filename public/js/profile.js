let finished = false;
$(document).ready(function () {
	console.log(selectedTap);
	if (selectedTap === 'comments') {
		loadComments();
	} else {
		loadPosts();
	}
});

function loadPosts() {
	if (!finished) {
		$.get(
			`/posts?skip=${skip}&limit=${limit}&profileUser=${profileUser}`,
			{ user: userLoggedIn, isReply: false },
			postsAndUserId => {
				let posts = postsAndUserId.posts;
				userId = postsAndUserId.userId;
				if (posts.length < 10) {
					finished = true;
				}
				outputPosts(posts, $('.postContent'));
				skip = skip + limit;
			}
		);
	}
}

function loadComments() {
	if (!finished) {
		$.get(
			`/posts?skip=${skip}&limit=${limit}&profileUser=${profileUser}`,
			{ user: userLoggedIn, isReply: true },
			postsAndUserId => {
				let posts = postsAndUserId.posts;
				userId = postsAndUserId.userId;
				if (posts.length < 10) {
					finished = true;
				}
				outputPosts(posts, $('.postContent'));
				skip = skip + limit;
			}
		);
	}
}

window.onscroll = () => {
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
		selectedTap === 'comments' ? loadComments() : loadPosts();
	}
};
