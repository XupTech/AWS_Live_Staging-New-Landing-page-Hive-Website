var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var schema = mongoose.Schema({
    username: { type: String, lowercase: true, index: { unique: true }, trim: true },
    email: { type: String, lowercase: true, index: { unique: true }, trim: true },
    password: String,
    name: String,
    role: String,
    status: Number,
    privileges: [],
    activity: {
        last_login: { type: Date },
        last_logout: { type: Date }
    }
}, { timestamps: true, versionKey: false });

schema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

var administrators = mongoose.model('administrators', schema, 'administrators');
module.exports = administrators;