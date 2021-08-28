let userId;
let isFinished = false;
$(document).ready(function () {
	function load() {
		if (!isFinished) {
			$.get(
				`/posts?skip=${skip}&limit=${limit}`,
				{ followingOnly: true },
				postsAndUserId => {
					let posts = postsAndUserId.posts;
					userId = postsAndUserId.userId;
					if (posts.length < 10) {
						isFinished = true;
					}
					outputPosts(posts, $('.postContent'));
					skip = skip + limit;
				}
			);
		}
	}
	load();

	window.onscroll = () => {
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
			load();
		}
	};
});
