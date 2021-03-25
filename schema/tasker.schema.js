var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var schema = mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    email: { type: String, lowercase: true, index: { unique: true }, trim: true },
    phone: {
        code: String,
        number: String
    },
    name: String,
    otp: String,
    gender: String,
    about: String,
    avg_review: { type: Number, default: 0 },
    total_review: { type: Number, default: 0 },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
        formatted_address : String
    },
    role: String,
    activity: {
        last_login: { type: Date },
        last_logout: { type: Date },
        last_active_time: { type: Date }
    },
    unique_code: String,
    verification_code: [],
    avatar: String,
    status: { type: Number, default: 1 },
    document_status: { type: Number, default: 2 },
    tasker_status: { type: Number, default: 0 },
    location_id: { type: mongoose.Schema.ObjectId },
    billing_address: {
        name: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
        phone: String
    },
    location: {
        lng: Number,
        lat: Number
    },
    availability_address: String,
    radius: Number,
    radiusby: String,
    birthdate: {
        year: Number,
        month: Number,
        date: Number
    },
    profile_details: [{
        _id: false,
        question: { type: mongoose.Schema.ObjectId, ref: 'question' },
        answer: String
    }],
    taskerskills: [{
        _id: false,
        categoryid: { type: mongoose.Schema.ObjectId, ref: 'categories' },
        childid: { type: mongoose.Schema.ObjectId, ref: 'categories' },
        name: String,
        quick_pitch: String,
        hour_rate: Number,
        ratetype: String,
        experience: { type: mongoose.Schema.ObjectId, ref: 'experience' },
        status: { type: Number, default: 1 }
    }],
    working_days: [{
        day: String,
        slots: [],
        selected: Number,
        wholeday: Number,
        hour: {
            morning: { type: mongoose.Schema.Types.Mixed, default: false },
            afternoon: { type: mongoose.Schema.Types.Mixed, default: false },
            evening: { type: mongoose.Schema.Types.Mixed, default: false }
        }
    }],
    doc: [{name: String, path: String, file_type: String}],

    /*non_working_days: [{
        date: String,
        slot: [],
        wholeday: { type: Number, default: 0 },
    }],*/

    tasker_area: {
        lat: Number,
        lng: Number
    },
    reset_code: String,
    emergency_contact: {
        name: String,
        email: String,
        phone: {
            code: Number,
            number: String
        },
        otp: String,
        verification: {
            email: String,
            phone: Number
        }
    },
    mode: String,
    availability: { type: Number, default: 1 },
    banking: {},
    stripe: String,
    device_info: {
        device_type: String, //ios/android
        device_token: String,
        gcm: String,
        android_notification_mode: String, //socket/gcm
        ios_notification_mode: String, //socket/apns
        notification_mode: String //socket/apns/gcm
    },
    provider_location: {
        provider_lng: Number,
        provider_lat: Number
    },
    google: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    facebook: {
        id: String,
        token: String,
        name: String,
        profile: String,
        email: String
    },
    facebookverify:Number,
    googleverify:Number,
    current_task: { type: mongoose.Schema.ObjectId, ref: 'task' },
    language: String,
    v3update: { type: String, default: 0 },
}, { timestamps: true, versionKey: false });

schema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

var tasker = mongoose.model('tasker', schema, 'tasker');
module.exports = tasker;