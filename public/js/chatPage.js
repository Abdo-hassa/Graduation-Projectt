var typing = false;
var lastTypingTime;
$(document).ready(() => {
	socket.emit('join room', chatId);
	socket.on('typing', () => $('.typingDots').show());
	socket.on('stop typing', () => $('.typingDots').hide());

	$('.inputTextbox').val('').focus();
	$.get(`/chats/${chatId}`, data => {
		if (data.users.length == 1) {
			alert('other user is not available now');
		}
		$('#chatName').text(getChatName(data));
	});

	$.get(`/chats/${chatId}/messages`, data => {
		var messages = [];
		let lastSenderId = '';

		data.forEach((message, index) => {
			var html = createMessageHtml(message, data[index + 1], lastSenderId);
			messages.push(html);

			lastSenderId = message.sender._id;
		});
		var messagesHtml = messages.join('');
		addMessagesHtmlToPage(messagesHtml);
		scrollToBottom(false);
		markMessagesAsRead();
	});
});

$('#chatNameButton').click(() => {
	let chatName = $('#chatNameTextbox').val().trim();

	$.ajax({
		url: '/chats/' + chatId,
		method: 'PUT',
		data: { chatName },
		success: (data, status, xhr) => {
			if (xhr.status !== 204) {
				alert('couldnt update name');
			} else {
				location.reload();
			}
		},
	});
});

$('.sendMessageButton').click(() => {
	messageSubmitted();
});
$('.inputTextbox').keydown(event => {
	updateTyping();

	if (event.which === 13) {
		messageSubmitted();
		return false;
	}
});

function updateTyping() {
	if (!connected) return;
	if (!typing) {
		typing = true;
		socket.emit('typing', chatId);
	}
	lastTypingTime = new Date().getTime();
	var timerLength = 3000;

	setTimeout(() => {
		var timeNow = new Date().getTime();
		var timeDiff = timeNow - lastTypingTime;

		if (timeDiff >= timerLength && typing) {
			socket.emit('stop typing', chatId);
			typing = false;
		}
	}, timerLength);
}

function messageSubmitted() {
	var content = $('.inputTextbox').val().trim();

	if (content != '') {
		sendMessage(content);
		$('.inputTextbox').val('');
		$('.inputTextbox').focus();
		socket.emit('stop typing', chatId);
		typing = false;
	}
}

function sendMessage(content) {
	$.post(
		'/chatMessage',
		{ content: content, chatId: chatId },
		(data, status, xhr) => {
			if (xhr.status != 201) {
				alert('Could not send message');
				$('.inputTextbox').val(content);
				return;
			}
			addChatMessageHtml(data);
			if (connected) {
				socket.emit('new message', data);
			}
		}
	);
}

function addMessagesHtmlToPage(html) {
	$('.chatMessages').append(html);
}

function addChatMessageHtml(message) {
	if (!message || !message._id) {
		alert('Message is not valid');
		return;
	}

	var messageDiv = createMessageHtml(message, null, '');

	addMessagesHtmlToPage(messageDiv);
	scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {
	let sender = message.sender;
	let senderName = sender.name;
	let currentSenderId = sender._id;
	let nextSenderId = nextMessage != null ? nextMessage.sender._id : '';

	let isFirst = lastSenderId !== currentSenderId;
	let isLast = nextSenderId !== currentSenderId;
	let isMine = message.sender._id === userLoggedIn._id;
	let liClassName = isMine ? 'mine' : 'theirs';

	let nameElement = '';
	if (isFirst) {
		liClassName += ' first';

		if (!isMine) {
			nameElement = `<span class="senderName">${senderName}</span>`;
		}
	}

	let profileImage = '';
	if (isLast) {
		liClassName += ' last';
		profileImage = `<img src=/${sender.Image} />`;
	}

	let imageContainer = '';
	if (!isMine) {
		imageContainer = `<div class="imageContainer">
													${profileImage}
											</div>`;
	}

	return `<li class='message ${liClassName}'>
							${imageContainer}
            <div class='messageContainer'>
                        ${nameElement}
                <span class='messageBody'>
                    ${message.content}
                </span>
            </div>
        </li>`;
}

function scrollToBottom(animated) {
	var container = $('.chatMessages');
	var scrollHeight = container[0].scrollHeight;
	if (animated) {
		container.animate({ scrollTop: scrollHeight }, 'slow');
	} else {
		container.scrollTop(scrollHeight);
	}
}

function markMessagesAsRead() {
	$.ajax({
		url: `/chats/${chatId}/messages/markAsRead`,
		type: 'PUT',
		success: () => refreshMessageBadge(),
	});
}
