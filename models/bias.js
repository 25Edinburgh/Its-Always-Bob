const mongoose = require('mongoose');
const { Schema } = mongoose;
const Bias = new Schema({
	nickname: {
		type: String,
		required: true,
		unique: true
	},
	elocamper: Number,
	elobam: Number
});

module.exports = mongoose.model('Account', Bias);
