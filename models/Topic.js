const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const topicSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	summary: {
		type: String,
		required: [true, 'summary required'],
	},
	description: {
		type: String,
		required: [true, 'Please enter the description'],
	},
	routeName: {
		type: String,
		required: [true, 'url required'],
	},
	references: [String],
	roadmaps: [{ type: Schema.Types.ObjectId, ref: 'roadmap' }],
	video: String,
});

const Topic = mongoose.model('topic', topicSchema);
module.exports = Topic;
