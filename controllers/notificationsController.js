exports.getNotifications = (req, res, next) => {
	res.render('notifications/notifications.ejs', {
		pageTitle: 'Notifications',
		userLoggedIn: req.session.user,
	});
};
