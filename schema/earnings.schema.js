var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var EARNINGS_SCHEMA = {};
EARNINGS_SCHEMA.EARNINGS = {
	task: { type: Schema.Types.ObjectId, ref: 'task' },
	tasker: { type: Schema.Types.ObjectId, ref: 'tasker' },
	earning_date: Date,
	worked_hours: String,
	earning_amount: Number
};

module.exports = EARNINGS_SCHEMA;
