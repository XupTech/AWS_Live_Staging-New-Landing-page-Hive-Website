var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TASK_SCHEMA = {};
TASK_SCHEMA.TASK = {
	user: { type: Schema.Types.ObjectId, ref: 'users' },
	tasker: { type: Schema.Types.ObjectId, ref: 'tasker' },
	category: { type: Schema.Types.ObjectId, ref: 'categories' },
	task_date: String,
	task_day: String,
	task_session: String,
	task_slots: [],
	location_name: String,
	booking_id: { type: String, unique: true },
	task_hour: String,
	tasker_address: String,
	//tasker_address: Object,
	billing_address: Object,
	service_address: String,
	//billing_address: String,
	//task_address: Object,
	task_address: Object,
	cancelled: Object,
	payment_mode: String,
	payment_type: String,
	bookingmode: String,
	usertaskcancellationreason: String,
	cancelledby: String,
	status: { type: Number, default: 1 },
	reject_job: [{
		provider_id: { type: Schema.ObjectId, ref: 'tasker' }
	}],
	booking_information: {
		service_type: String,
		//service_id: { type: Schema.ObjectId, ref: 'categories' },
		work_type: String,
		//work_id: String,
		instruction: String,
		booking_date: Date,
		reach_date: String,
		est_reach_date: Date,
		//completed_date: Date,
		//job_email: String,
		location: String,
		user_latlong: {
			lon: Number,
			lat: Number
		},
		//apx_reach_date: Date
	},
	location: {
		lat: Number,
		log: Number
	},
	invoice: {
		amount: {
			minimum_cost: Number,
			//hourly_rate: Number,
			task_cost: Number,
			worked_hours_cost: Number,
			wallet_usage: Number,
			admin_commission: Number,
			reimbursement: Number,
			service_tax: Number,
			total: Number,
			discount: Number,
			coupon: Number,
			grand_total: Number,
			balance_amount: Number,
			extra_amount: Number,
			complete_total: Number,
			tasker_earning: Number,
			summary: String
		},
		miscellaneous: [{
			_id: false,
			name: String,
			price: Number
		}],
		worked_hours: Number,
		worked_human_hours: Number,
		worked_human_mins: Number,
		worked_hours_human: String,
		reimbursement_description: String,
		currency: String,
		coupon: String,
		status: Number
	},
	transactions: [{ type: Schema.ObjectId, ref: 'transaction' }],
	ratings: {},
	payment_gateway_response: Object,
	admin_commission_percentage: Number,
	task_description: String,
	pay_status: Number,
	payee_status: { type: Number, default: 0 },
	history: {},
	cancellation: {},
	mobile_status: Number,
	otp: String,
	hourly_rate: Number,
	ratetype: Number,
	ratetype_name: String,
	task_time: String,
};
module.exports = TASK_SCHEMA;

/*
	cancellation: {
		reason: String,
		type: String,
		date:Date
		status: Number
	}
*/