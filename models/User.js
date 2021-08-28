const mongoose = require('mongoose');
const Post = require('./Post');
const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: String,
		bio: String,
		Image: String,
		yearOfBirth: String,
		gender: String,
		skills: [],
		websites: [String],
		country: String,
		nativeLang: String,
		likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
		following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		bookmarks: [{ type: Schema.Types.ObjectId, ref: 'roadmap' }],
		resetToken: String,
		resetTokenExpiration: Date,
		role: String,
	},
	{ autoIndex: true }
);

userSchema.methods.hidePrivateData = function () {
	const user = this;

	const userObject = user.toObject();

	delete userObject.password;
	return userObject;
};

userSchema.pre('remove', async function (next) {
	const user = this;

	await Post.deleteMany({ user: user._id });
	next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
