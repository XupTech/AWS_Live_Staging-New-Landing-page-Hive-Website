var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

/*---new db schema----*/
var config_pages_schema = require('../schema/page.schema.js');
var config_email_template_schema = require('../schema/emailtemplate.schema.js');
var config_slider_schema = require('../schema/sliders.schema.js');
var config_faq_schema = require('../schema/faqs.schema.js');
var config_postheader_schema = require('../schema/postheaders.schema.js');
var config_category_schema = require('../schema/categories.schema.js');
var config_experience_schema = require('../schema/experience.schema.js');
var config_question_schema = require('../schema/questions.schema.js');
var config_settings_schema = require('../schema/setting.schema.js');
var config_newsletter_schema = require('../schema/newsletter.schema.js');
var config_paymentGateway_schema = require('../schema/payment-gateway.js');
var config_images_schema = require('../schema/images.schema.js');
var config_messages_schema = require('../schema/messages.schema.js');
var config_contact_schema = require('../schema/contact.schema.js');
var config_task_schema = require('../schema/task.schema.js');
var config_reviewOptions_schema = require('../schema/reviewOptions.schema.js');
var config_transaction_schema = require('../schema/transaction.schema.js');
var config_cancellation_reason_schema = require('../schema/cancellationReason.schema.js');
var wallet_reacharge_schema = require('../schema/wallet.schema.js');
var config_coupon_schema = require('../schema/coupon.schema.js');
var config_paid_schema = require('../schema/paid.schema.js');
var config_billing_schema = require('../schema/billingcycle.schema.js');
var config_notifications_schema = require('../schema/notifications.schema.js');
var config_notification_emailtemplate_schema = require('../schema/notificationemailtemplate.schema.js');
var config_posttask_schema = require('../schema/posttask.schema.js');
var config_peoplecmd_schema = require('../schema/peoplecmd.schema.js');
var config_earnings_schema = require('../schema/earnings.schema.js');

// define the schema for our user model
var pageschema = mongoose.Schema(config_pages_schema.PAGES, { timestamps: true, versionKey: false });
var emailtemplateSchema = mongoose.Schema(config_email_template_schema.template, { timestamps: true, versionKey: false });
var sliderSchema = mongoose.Schema(config_slider_schema.SLIDERS, { timestamps: true, versionKey: false });
var categorySchema = mongoose.Schema(config_category_schema.CATEGORIES, { timestamps: true, versionKey: false });
var faqSchema = mongoose.Schema(config_faq_schema.FAQ, { timestamps: true, versionKey: false });
var postheaderSchema = mongoose.Schema(config_postheader_schema.POSTHEADER, { timestamps: true, versionKey: false });
var experienceSchema = mongoose.Schema(config_experience_schema.EXPERIENCES, { timestamps: true, versionKey: false });
var questionSchema = mongoose.Schema(config_question_schema.QUESTIONS, { timestamps: true, versionKey: false });
var settingsSchema = mongoose.Schema(config_settings_schema.settings, { timestamps: true, versionKey: false });
var currencySchema = mongoose.Schema(config_settings_schema.currency, { timestamps: true, versionKey: false });
var languagesSchema = mongoose.Schema(config_settings_schema.languages, { timestamps: true, versionKey: false });
var newsletterSchema = mongoose.Schema(config_newsletter_schema.SUBSCRIBER, { timestamps: true, versionKey: false });
var paymentGatewaySchema = mongoose.Schema(config_paymentGateway_schema.PAYMENTGATEWAY, { timestamps: true, versionKey: false });
var imagesSchema = mongoose.Schema(config_images_schema.IMAGES, { timestamps: true, versionKey: false });
var messagesSchema = mongoose.Schema(config_messages_schema.MESSAGES, { timestamps: true, versionKey: false });
var contactusSchema = mongoose.Schema(config_contact_schema.CONTACT, { timestamps: true, versionKey: false });
var taskSchema = mongoose.Schema(config_task_schema.TASK, { timestamps: true, versionKey: false });
var reviewOptionsSchema = mongoose.Schema(config_reviewOptions_schema.REVIEW_OPTIONS, { timestamps: true, versionKey: false });
var transactionSchema = mongoose.Schema(config_transaction_schema.TRANSACTION, { timestamps: true, versionKey: false });
var cancellationReasonSchema = mongoose.Schema(config_cancellation_reason_schema.CANCELLATION, { timestamps: true, versionKey: false });
var walletReachargeSchema = mongoose.Schema(wallet_reacharge_schema.WALLET, { timestamps: true, versionKey: false });
var couponSchema = mongoose.Schema(config_coupon_schema.COUPON, { timestamps: true, versionKey: false });
var paidSchema = mongoose.Schema(config_paid_schema.PAID, { timestamps: true, versionKey: false });
var billingSchema = mongoose.Schema(config_billing_schema.BILLING, { timestamps: true, versionKey: false });
var notificationsSchema = mongoose.Schema(config_notifications_schema.NOTIFICATIONS, { timestamps: true, versionKey: false });
var emailnotificationsSchema = mongoose.Schema(config_notification_emailtemplate_schema.template, { timestamps: true, versionKey: false });
var posttaskSchema = mongoose.Schema(config_posttask_schema.POSTTASK, { timestamps: true, versionKey: false });
var peoplecmdSchema = mongoose.Schema(config_peoplecmd_schema.PEOPLECMD, { timestamps: true, versionKey: false });
var earningsSchema = mongoose.Schema(config_earnings_schema.EARNINGS, { timestamps: true, versionKey: false });

// create the model for users and expose it to our app
var pages = mongoose.model('pages', pageschema, 'pages');
var emailtemplate = mongoose.model('email_template', emailtemplateSchema, 'email_template');
var slider = mongoose.model('sliders', sliderSchema, 'sliders');
var coupon = mongoose.model('coupon', couponSchema, 'coupon');
var category = mongoose.model('categories', categorySchema, 'categories');
var faq = mongoose.model('faq', faqSchema, 'faq');
var postheader = mongoose.model('postheader', postheaderSchema, 'postheader');
var experience = mongoose.model('experience', experienceSchema, 'experience');
var question = mongoose.model('question', questionSchema, 'question');
var settings = mongoose.model('settings', settingsSchema, 'settings');
var languages = mongoose.model('languages', languagesSchema, 'languages');
var currencies = mongoose.model('currencies', currencySchema, 'currencies');
var newsletter = mongoose.model('newsletter_subscriber', newsletterSchema, 'newsletter_subscriber');
var paymentgateway = mongoose.model('payment_gateway', paymentGatewaySchema, 'payment_gateway');
var images = mongoose.model('images', imagesSchema, 'images');
var messages = mongoose.model('messages', messagesSchema, 'messages');
var contact = mongoose.model('contact', contactusSchema, 'contact');
var task = mongoose.model('task', taskSchema, 'task');
var review = mongoose.model('reviews', reviewOptionsSchema, 'reviews');
var transaction = mongoose.model('transaction', transactionSchema, 'transaction');
var cancellation = mongoose.model('cancellation', cancellationReasonSchema, 'cancellation');
var walletReacharge = mongoose.model('wallet', walletReachargeSchema, 'wallet');
var paid = mongoose.model('paid', paidSchema, 'paid');
var billing = mongoose.model('billing', billingSchema, 'billing');
var notifications = mongoose.model('notifications', notificationsSchema, 'notifications');
var emailnotifications = mongoose.model('email_notifications', emailnotificationsSchema, 'email_notifications');
var posttask = mongoose.model('posttasks', posttaskSchema, 'posttasks');
var peoplecmd = mongoose.model('peoplecmd', peoplecmdSchema, 'peoplecmd');
var earnings = mongoose.model('earnings', earningsSchema, 'earnings');

var administrators = require('../schema/administrators.schema.js');
var users = require('../schema/user.schema.js');
var tasker = require('../schema/tasker.schema.js');
var tasker_documents = require('../schema/taskerdocument.schema.js');

var db = {
    'admins': administrators,
    'users': users,
    'tasker': tasker,
    'pages': pages,
    'emailtemplate': emailtemplate,
    'slider': slider,
    'coupon': coupon,
    'category': category,
    'faq': faq,
    'postheader': postheader,
    'experience': experience,
    'question': question,
    'settings': settings,
    'languages': languages,
    'currencies': currencies,
    'newsletter': newsletter,
    'paymentgateway': paymentgateway,
    'images': images,
    'messages': messages,
    'contact': contact,
    'task': task,
    'review': review,
    'transaction': transaction,
    'cancellation': cancellation,
    'walletReacharge': walletReacharge,
    'paid': paid,
    'billing': billing,
    'notifications': notifications,
    'emailnotifications': emailnotifications,
    'posttask': posttask,
    'peoplecmd': peoplecmd,
    'earnings': earnings,
    'tasker_documents': tasker_documents
};


function GetDocument(model, query, projection, extension, callback) {
    var query = db[model].find(query, projection, extension.options);
    if (extension.populate) {
        query.populate(extension.populate);
    }
    if (extension.sort) {
        query.sort(extension.sort);
    }
    query.exec(function (err, docs) {
        if (extension.count) {
            query.count(function (err, docs) {
                callback(err, docs);
            });
        } else {
            callback(err, docs);
        }
    });
}

function GetOneDocument(model, query, projection, extension, callback) {
    var query = db[model].findOne(query, projection, extension.options);
    if (extension.populate) {
        query.populate(extension.populate);
    }
    if (extension.sort) {
        query.sort(extension.sort);
    }
    query.exec(function (err, docs) {
        callback(err, docs);
    });
}

function GetAggregation(model, query, callback) {
    db[model].aggregate(query).exec(function (err, docs) {
        callback(err, docs);
    });
}

function InsertDocument(model, docs, callback) {
    var doc_obj = new db[model](docs);
    doc_obj.save(function (err, numAffected) {
        callback(err, numAffected);
    })
}

function DeleteDocument(model, criteria, callback) {
    db[model].remove(criteria, function (err, docs) {
        callback(err, docs);
    });
}

function UpdateDocument(model, criteria, doc, options, callback) {
    db[model].update(criteria, doc, options, function (err, docs) {
        callback(err, docs);
    });
}

function findOneAndUpdate(model, criteria, doc, options, callback) {
    db[model].findOneAndUpdate(criteria, doc, options, function (err, docs) {
        callback(err, docs);
    });
}

/* function findOne(model, query, projection, extension, callback) {
   db[model].findOne(query, projection, extension , function(err , docs){
    callback(err, docs);
   });
} */


function GetCount(model, conditions, callback) {
    db[model].count(conditions, function (err, count) {
        callback(err, count);
    });
}


function PopulateDocument(model, docs, options, callback) {
    db[model].populate(docs, options, function (err, docs) {
        callback(err, docs);
    });
}

function RemoveDocument(model, criteria, callback) {
    db[model].remove(criteria, function (err, docs) {
        callback(err, docs);
    });
}


const GetAggregationDoc = (model, query) => {
    return new Promise((resolve, reject) => {
        db[model].aggregate(query).exec(function (err, docs) {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
}

const GetOneDoc = (model, query, projection, extension) => {
    const Query = db[model].findOne(query, projection, extension.options);
    return new Promise((resolve, reject) => {
        if (extension.populate) {
            Query.populate(extension.populate);
        }
        if (extension.sort) {
            Query.sort(extension.sort);
        }
        Query.exec((err, docs) => {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
}

const GetDocs = (model, query, projection, extension) => {
    const Query = db[model].find(query, projection, extension.options);
    return new Promise((resolve, reject) => {
        if (extension.populate) {
            Query.populate(extension.populate);
        }
        if (extension.sort) {
            Query.sort(extension.sort);
        }
        Query.exec((err, docs) => {
            if (extension.count) {
                Query.count((err, docs) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs);
                    }
                });
            } else {
                if (err) {
                    reject(err);
                } else {
                    resolve(docs);
                }
            }
        });
    });
}

const UpdateDoc = (model, criteria, doc, options) => {
    return new Promise((resolve, reject) => {
        db[model].update(criteria, doc, options, (err, docs) => {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
}

const InsertDoc = (model, docs) => {
    const doc_obj = new db[model](docs);
    return new Promise((resolve, reject) => {
        doc_obj.save(function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    });
}


module.exports = {
    "GetDocument": GetDocument,
    "GetOneDocument": GetOneDocument,
    "InsertDocument": InsertDocument,
    "DeleteDocument": DeleteDocument,
    "UpdateDocument": UpdateDocument,
    "GetAggregation": GetAggregation,
    "PopulateDocument": PopulateDocument,
    "RemoveDocument": RemoveDocument,
    "GetCount": GetCount,
    "findOneAndUpdate": findOneAndUpdate,

    "GetAggregationDoc": GetAggregationDoc,
    "GetOneDoc": GetOneDoc,
    "GetDocs": GetDocs,
    "UpdateDoc": UpdateDoc,
    "InsertDoc": InsertDoc
};
