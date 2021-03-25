var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var POSTTASK_SCHEMA = {};
POSTTASK_SCHEMA.POSTTASK = {

    name: String,
    description: String,
    image: String,
    img_name: String,
    img_path: String,
    seo: {
        title: String
    },
    postTask: [{
        name: String,
        description: String,
        lang_code: String,
        lang_name: String
    }],
    status: { type: Number, default: 1 }
};

module.exports = POSTTASK_SCHEMA;
