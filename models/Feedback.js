const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
	name: { type: String, trim: true },
	email: String,
	message: String,
});

module.exports = mongoose.model('Feedback', feedbackSchema);
