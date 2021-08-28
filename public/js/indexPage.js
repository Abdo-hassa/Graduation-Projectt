$(document).ready(() => {
	const element = document.querySelector('#submit');
	element.addEventListener('submit', event => {
		event.preventDefault();
	});
});

$('#feedbackButton').click(e => {
	var name = $('#name');
	var email = $('#email');
	var message = $('#message');
	var data = {
		name: name.val(),
		email: email.val(),
		message: message.val(),
	};
	console.log(data);
	$.post('/feedback', data, allData => {});
	name.val('');
	email.val('');
	message.val('');
	alert('Thank you for your feedback');
});
