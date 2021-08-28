const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		description: {
			type: String,
			required: [true, 'Please enter the description'],
			trim: true,
		},
		hashtags: [String],
		likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		replyTo: { type: Schema.Types.ObjectId, ref: 'Post' },
		replies: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

postSchema.virtual('postCount').get(function () {
	return Post.findById({ user: this._id }).count;
});


postSchema.pre('remove', async function(next) {
	const post = this;

	await Post.deleteMany({replyTo: {$eq: post._id}})
	next();
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
