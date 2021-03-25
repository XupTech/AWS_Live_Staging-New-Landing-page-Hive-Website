var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var POSTHEADER_SCHEMA = {};

POSTHEADER_SCHEMA.POSTHEADER = {
	title: String,
	description: String,
	image: String,
	img_name: String,
	img_path: String,
	postHeader:[{
		title: String,
		description: String,
		lang_code: String,
		lang_name: String
	}],
	status: { type: Number, default: 1 }
};

module.exports = POSTHEADER_SCHEMA;
