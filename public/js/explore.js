let userId;
let finished = false;
$(document).ready(function () {
	function load() {
		if (!finished) {
			$.get(
				`/posts?skip=${skip}&limit=${limit}`,
				{ isReply: false },
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
	load();

	window.onscroll = () => {
		if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
			load();
		}
	};
});
