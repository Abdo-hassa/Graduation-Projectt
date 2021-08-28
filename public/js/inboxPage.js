$(document).ready(() => {
	$.get('/chats', (data, status, xhr) => {
		if (xhr.status == 400) {
			alert('Could not get chat list.');
		} else {
			outputChatList(data, $('.resultsContainer'));
		}
	});
});

function outputChatList(chatList, container) {
	chatList.forEach(chat => {
		var html = createChatHtml(chat);
		container.append(html);
	});

	if (chatList.length == 0) {
		container.append("<span class='noResults'>Nothing to show.</span>");
	}
}

function createChatHtml(chatData) {
	var chatName = getChatName(chatData);
	var image = getChatImageElements(chatData);
	var latestMessage = getLatestMessage(chatData.latestMessage);

	let activeClass =
		!chatData.latestMessage ||
		chatData.latestMessage.readBy.includes(userLoggedIn._id)
			? ''
			: 'active';

	return `<a style =" text-decoration: none;" href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
			${image}
			<div class='resultsDetailsContainer ellipsis'>
				<span class='heading ellipsis'>${chatName}</span>
				<span class='subText ellipsis'>${latestMessage}</span>
			</div>
		</a>`;
}

function getLatestMessage(latestMessage) {
	if (latestMessage != null) {
		var sender = latestMessage.sender;
		return `${sender.name} : ${latestMessage.content}`;
	}

	return 'New chat';
}

function getChatImageElements(chatData) {
	var otherChatUsers = getOtherChatUsers(chatData.users);

	var groupChatClass = '';
	var chatImage = getUserChatImageElement(otherChatUsers[0]);

	if (otherChatUsers.length > 1) {
		groupChatClass = 'groupChatImage';
		chatImage += getUserChatImageElement(otherChatUsers[1]);
	}

	return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
	if (!user || !user.Image) {
		// user.Image = 'assets/img/default.png';
		return alert('User passed into function is invalid');
	}

	return `<img src='${user.Image}' alt='User's profile pic'>`;
}
