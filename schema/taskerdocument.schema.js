var mongoose = require("mongoose");
 
var schema = mongoose.Schema({
	name: String,
	replace_name: String,
	//description: String,
	status: { type: Number, default: 1 },
},  { timestamps: true, versionKey: false });

var tasker_documents = mongoose.model('tasker_documents', schema, 'tasker_documents');
module.exports = tasker_documents;