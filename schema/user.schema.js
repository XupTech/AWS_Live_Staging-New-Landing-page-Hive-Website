var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var schema = mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    email: { type: String, lowercase: true, index: { unique: true }, trim: true },
    password: String,
    phone: {
        code: String,
        number: String,
    },
    otp: String,
    name: String,
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
        mobile: Number,
        street: String,
        landmark: String,
        locality: String,
        formatted_address: String
    },
    addressList: [{
        location: {
            lat: Number,
            lng: Number
        },
        address: String,
        status: { type: Number, default: 1 }
    }],
    role: String,
    activity: {
        last_login: { type: Date },
        last_logout: { type: Date }
    },
    referal_code: String,
    refer_history: [{
        reference_id: String,
        reference_mail: String,
        amount_earns: Number,
        reference_date: Date,
        used: String
    }],
    unique_code: { type: String, index: { unique: true }, trim: true },
    verification_code: [],
    avatar: String,
    status: { type: Number, default: 1 },
    wallet_id: { type: mongoose.Schema.ObjectId },
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
    type: String,
    geo: [],
    reset_code: String,
    mode: String,
    facebook: {
        id: String,
        token: String,
        name: String,
        profile: String,
        email: String
    },
    google: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    device_info: {
        device_type: String, //ios/android
        device_token: String,
        gcm: String,
        android_notification_mode: String, //socket/gcm
        ios_notification_mode: String, //socket/apns
        //notification_mode: String //socket/apns/gcm
    },
    facebookverify:Number,
    googleverify:Number,
    language: String
}, { timestamps: true, versionKey: false });

schema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
schema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

var users = mongoose.model('users', schema, 'users');
module.exports = users;