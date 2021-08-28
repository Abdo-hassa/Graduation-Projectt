const deletePost = btn => {
	const postId = btn.parentNode.querySelector('[name=postId]').value;

	const postElement = btn.closest('#post');

	console.log(postId);
	fetch('/admin/dashboard/posts/delete/' + postId, {
		method: 'DELETE',
	})
		.then(result => {
			return result.json();
		})
		.then(data => {
			console.log(data);
			postElement.remove(postElement);
		})
		.catch(err => {
			console.log(err);
		});
};

const deleteUser = btn => {
	const userId = btn.parentNode.querySelector('[name=userId]').value;

	const userElement = btn.closest('#user');
	fetch('/admin/dashboard/users/delete/' + userId, {
		method: 'DELETE',
	})
		.then(result => {
			return result.json();
		})
		.then(data => {
			userElement.remove(userElement);
		})
		.catch(err => {
			console.log(err);
		});
};

const deleteRoadmap = btn => {
	const roadmapId = btn.parentNode.querySelector('[name=roadmapId]').value;

	const roadmapElement = btn.closest('#roadmap');
	fetch('/admin/dashboard/roadmaps/delete/' + roadmapId, {
		method: 'DELETE',
	})
		.then(result => {
			return result.json();
		})
		.then(data => {
			roadmapElement.remove(roadmapElement);
		})
		.catch(err => {
			console.log(err);
		});
};

const deleteTopic = btn => {
	const topicId = btn.parentNode.querySelector('[name=topicId]').value;

	const topicElement = btn.closest('#topic');
	fetch('/admin/dashboard/topics/delete/' + topicId, {
		method: 'DELETE',
	})
		.then(result => {
			return result.json();
		})
		.then(data => {
			topicElement.remove(topicElement);
		})
		.catch(err => {
			console.log(err);
		});
};

const deletefeedback = btn => {
	const feedbackId = btn.parentNode.querySelector('[name=feedbackId]').value;

	const feedbackElement = btn.closest('#feedback');
	fetch('/admin/dashboard/feedback/delete/' + feedbackId, {
		method: 'DELETE',
	})
		.then(result => {
			return result.json();
		})
		.then(data => {
			feedbackElement.remove(feedbackElement);
		})
		.catch(err => {
			console.log(err);
		});
};

