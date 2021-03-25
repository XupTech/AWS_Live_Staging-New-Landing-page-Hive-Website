module.exports = function (io) {

    var db = require('../model/mongodb.js');
    var async = require('async');
    var CONFIG = require('../config/config');
    var push = require('../model/pushNotification.js')(io);
    var mail = require('../model/mail.js');
    var mailcontent = require('../model/mailcontent.js');
    var moment = require("moment");
    var timezone = require('moment-timezone');
    var stripe = require('stripe')('');
    var fs = require('fs');
    var library = require('../model/library.js');

    function updateAvailability(data, callback) {
        db.UpdateDocument('tasker', { _id: data.tasker }, { availability: data.availability }, function (error, tasker) {

            var notifications = { 'provider_id': data.tasker, 'status': data.availability };
            var message = "Availability Updated";

            push.sendUniquenotification(data.tasker, message, 'availability_status', 'ANDROID', notifications, 'PROVIDER', function (err, response, body) { });

            // io.of('/notify').in(data.tasker).emit('availability status', { status: data.availability });
            callback(error, tasker);
        });
    }

    function taskerRegister(dat, callback) {
        console.log("tasker register call");
        var data = {}; 
        db.InsertDocument('tasker', dat, function (err, result) {
            if (err) {
                data.response = 'Unable save your data';
                callback(data);
            } else {
                async.waterfall([
                    function (callback) {
                        db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                            if (err || !settings) { data.response = 'Configure your website settings'; callback(data); }
                            else { callback(err, settings.settings); }
                        });
                    }
                ], function (err, settings) {

                    var mailData = {};
                    mailData.template = 'Taskersignupmessagetotasker';
                    mailData.to = result.email;
                    mailData.language = result.language;
                    mailData.html = [];
                    mailData.html.push({ name: 'taskername', value: result.username });
                    mailData.html.push({ name: 'email', value: result.email });

                    mailcontent.sendmail(mailData, function (err, response) { });

                    callback(err, result);

                });
            }
        });
    }

    function connectStripe(data, callback) {

        db.GetOneDocument('tasker', { _id: data.tasker }, {}, {}, function(err, tasker) {
            if (err || !tasker) {
                callback(err, tasker);
            } else {
                db.GetOneDocument('paymentgateway', { status: { $ne: 0 }, alias: 'stripe' }, {}, {}, function(err, StripeConnectConfig) {
                    if (err || !StripeConnectConfig) {
                        callback(err, StripeConnectConfig);
                    } else {
                        stripe.setApiKey(StripeConnectConfig.settings.sandbox_secret_key);

                        stripe.setApiVersion('2019-11-05');

                        /*var fp = fs.readFileSync(tasker.doc[0].path);

                        stripe.files.create({
                          purpose: 'identity_document',
                          file: {
                            data: fp,
                            name: 'file.jpg',
                            type: tasker.doc[0].file_type
                          }
                        }, function(err, file) {
                            if(err) {
                                console.log("Unable to upload file");
                            } else {*/

                                var accountCreate = {
                                    country: "US",
                                    type: "custom",
                                    requested_capabilities: ['card_payments', 'transfers'],
                                    business_type: "individual",
                                    individual: {
                                        /*'address': {
                                            'city': tasker.address.city,
                                            'country': 'US',
                                            'line1': tasker.address.line1,
                                            'line2': tasker.address.line2,
                                            'postal_code': tasker.address.zipcode,
                                            'state': tasker.address.state

                                        },*/
                                        'dob': {
                                            'day': tasker.birthdate.date,
                                            'month': tasker.birthdate.month,
                                            'year': tasker.birthdate.year
                                        },
                                        'email': tasker.email,
                                        'first_name': tasker.firstname,
                                        'last_name': tasker.lastname,
                                        'id_number': '000000000',
                                        'phone': tasker.phone.number,
                                        /*'verification': {
                                            'document': {
                                                'front': file.id
                                            }
                                        }*/
                                    },
                                    business_profile: {
                                        'product_description': 'Handling jobs between user and tasker.',
                                        'mcc': '5734'
                                    },
                                    tos_acceptance: {
                                        'date': Math.floor(Date.now() / 1000),
                                        'ip': data.ip
                                    }
                                };

                                stripe.accounts.create(accountCreate, function(err, account) {
                                    console.log("stripe err", err, account);
                                    if (err) {
                                        callback(err, account);
                                    } else {
                                        db.UpdateDocument('tasker', { '_id': data.tasker }, { 'stripe': account.id }, {}, function (err, docdata) {
                                            callback(err, account);
                                        });    
                                    }
                                });
                            /*}
                        }); */   
                    }    
                });
            }
        });
    }

    function addStripeBankAccount(query, data, callback) {

        console.log('addStripeBankAccountaddStripeBankAccount',data);

        db.GetOneDocument('tasker', { _id: query.tasker }, {}, {}, function(err, tasker) {
            if (err || !tasker) {
                callback(err, tasker);
            } else {
                db.GetOneDocument('paymentgateway', { status: { $ne: 0 }, alias: 'stripe' }, {}, {}, function(err, StripeConnectConfig) {
                    if (err || !StripeConnectConfig) {
                        callback(err, StripeConnectConfig);
                    } else {
                        stripe.setApiKey(StripeConnectConfig.settings.sandbox_secret_key);

                        stripe.setApiVersion('2019-11-05');

                        stripe.accounts.createExternalAccount(tasker.stripe, {
                            external_account: {
                                'object': 'bank_account',
                                'account_number': data.acc_number,
                                'country': 'US',
                                'currency': 'usd',
                                'account_holder_name': data.acc_holder_name,
                                'account_holder_type': 'individual',
                                'routing_number': data.routing_number
                            }
                        }, function(err, account) {
                            if(err) {
                                callback(err, account);
                            } else {
                                callback(err, account);
                            }
                            
                        });
                    }
                });        
            }
        });     
    }

    return {
        updateAvailability: updateAvailability,
        taskerRegister: taskerRegister,
        connectStripe: connectStripe,
        addStripeBankAccount: addStripeBankAccount
    };
};
