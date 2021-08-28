const mongoose = require('mongoose');
const Topic = require('./Topic');
const User = require('./User');
const Schema = mongoose.Schema;

const roadmapSchema = new Schema({
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
	steps: [{ type: Schema.Types.ObjectId, ref: 'topic' }],
});

roadmapSchema.pre('remove', async function (next) {
	const roadmap = this;
	const roadmapName = roadmap.title;
	await User.updateMany({}, { $pull: { skills: roadmapName } });
	await Topic.deleteMany({ roadmap });
	next();
});

const Roadmap = mongoose.model('roadmap', roadmapSchema);
module.exports = Roadmap;
