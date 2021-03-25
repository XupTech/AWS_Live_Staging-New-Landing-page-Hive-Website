module.exports = function (app, io) {

    var builder = require('xmlbuilder');
    var db = require('../../model/mongodb.js');
    var async = require('async');
    var jwt = require('jsonwebtoken');
    var CONFIG = require('../../config/config');
    var library = require('../../model/library.js');
    var bcrypt = require('bcrypt-nodejs');
    var mongoose = require('mongoose');
    var userLibrary = require('../../model/user.js')(io);

    var router = {};

    router.userlogin = function (req, res) {
        var errors = req.validationErrors();
        var data = {}
        data.status = "0";
        if (errors) { data.message = errors[0].msg; res.send(data); return; }
        var authHeader = jwt.sign(req.body.phone, CONFIG.SECRET_KEY);
        db.GetOneDocument('users', { 'phone': req.body.phone, 'status': { $ne: 0 } }, {}, {}, function (err, user) {
            if (err) {
                res.send(err);
            }
            else if (!err && !user) {
                res.send({ message: 'Phone not exists' });
            }
            else {
                if (user) {
                    db.GetOneDocument('settings', { 'alias': 'sms' }, {}, {}, function (err, settings) {
                        if (err || !settings) {
                            res.send({ message: 'Unable to get data' });
                        } else {
                            if (settings) {
                                if (settings.settings.twilio.mode == 'development') { //development
                                    db.GetOneDocument('users', { '_id': user._id, 'verification_code.mobile': { $exists: false } }, {}, {}, function (err, user) {
                                        if (err || !user) {
                                            res.send({ message: 'Verify Your Mobile Number' });
                                        } else {
                                            if (user.status == 2) {
                                                res.send({ message: 'Your account has been deactivated/suspended, Contact administrator to activate your account' });
                                            } else {
                                                var data = { activity: {} };
                                                data.activity.last_login = Date();
                                                db.UpdateDocument('users', { _id: user._id }, data, {}, function (err, docdata) {
                                                    if (err) {
                                                        res.send(err);
                                                    } else {
                                                        var data = {};
                                                        data.user = user.firstname;
                                                        data.user_id = user._id;
                                                        data.email = user.email;
                                                        data.phone = user.phone.number;
                                                        data.user_type = user.role;
                                                        data.token = authHeader;
                                                        if (user.avatar) {
                                                            data.avatar = user.avatar;
                                                        }
                                                        // console.log('datadata', data);
                                                        res.send(data);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    db.GetOneDocument('users', { 'phone': req.body.phone, 'status': { $in: [1, 2] } }, {}, {}, function (err, user) {
                                        if (err || !user) {
                                            res.send({ message: 'Invalid User' });
                                        } else {
                                            if (user.status == 2) {
                                                res.send({ message: 'Your account has been deactivated/suspended, Contact administrator to activate your account' });
                                            } else {
                                                var data = { activity: {} };
                                                data.token = authHeader;
                                                data.activity.last_login = Date();
                                                db.UpdateDocument('users', { _id: user._id }, data, {}, function (err, docdata) {
                                                    if (err) {
                                                        res.send(err);
                                                    } else {
                                                        var data = {};
                                                        data.user = user.firstname;
                                                        data.user_id = user._id;
                                                        data.email = user.email;
                                                        data.phone = user.phone.number;
                                                        data.user_type = user.role;
                                                        data.token = authHeader;
                                                        if (user.avatar) {
                                                            data.avatar = user.avatar;
                                                        }
                                                        // console.log('data2', data);
                                                        res.send(data);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    })
                } else {
                    res.send({ message: 'Invalid Login, Please try again' });
                }
            }
        })

    }

    router.taskerlogin = function (req, res) {

        req.checkBody('phone', 'Phone is required').notEmpty();
        var errors = req.validationErrors();

        var data = {}
        data.status = "0";
        if (errors) { data.message = errors[0].msg; res.send(data); return; }
    
        var authHeader = jwt.sign(req.body.phone, CONFIG.SECRET_KEY);

        db.GetOneDocument('tasker', { 'phone.code': req.body.phone.code, 'phone.number': req.body.phone.number, 'status': { $in: [1, 2, 3] } }, {}, {}, function (err, user) {
            if (err) {
                res.send(err);
            } else if (!err && !user) {
                res.send({ message: 'Phone not exists' });
            } else {
                var data = { activity: {} };
                data.activity.last_login = Date();
                db.UpdateDocument('tasker', { _id: user._id }, data, {}, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        var data = {};
                        data.token = authHeader;
                        data.user = user.firstname;
                        data.user_id = user._id;
                        data.email = user.email;
                        data.phone = user.phone.number;
                        data.user_type = user.role;
                        data.status = user.status;
                        data.avatar = user.avatar;
                        res.send(data);
                    }
                }); 
            }
        });

    }


    router.userregister = function (req, res) {
        process.nextTick(function () {
            db.GetOneDocument('users', { "phone.number": req.body.phone.number }, {}, {}, function (err, pdocdata) {
                if (err) {
                    res.send(err);
                } else {
                    if (pdocdata && pdocdata.phone.code == req.body.phone.code && pdocdata.phone.number == req.body.phone.number) {
                        res.status(400).send('PHONE NUMBER ALREADY EXISTS');
                    } else {
                        // db.GetOneDocument('users', { 'username': req.body.username }, {}, {}, function (err, user) {
                            // if (err) {
                            //     res.send(err);
                            // } else {
                                // if (user && user.username == req.body.username) {
                                //     res.status(400).send('USER NAME ALREADY EXISTS');
                                // } else {
                                    db.GetOneDocument('users', { 'email': req.body.email }, {}, {}, function (err, users) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        else {
                                            if (users && users.email == req.body.email) {
                                                res.status(400).send('EMAIL ID  ALREADY EXISTS');
                                            }
                                            // return done('Email Id Or User name already exists', false, null);
                                            else {
                                                db.GetOneDocument('settings', { 'alias': 'sms' }, {}, {}, function (err, smsdocdata) {
                                                    if (err || !smsdocdata) {
                                                        res.send(err);
                                                    } else {
                                                        var newUser = {};
                                                        var authHeader = jwt.sign(req.body.firstname, CONFIG.SECRET_KEY);
                                                        newUser.unique_code = library.randomString(8, '#A');
                                                        newUser.username = req.body.username;
                                                        newUser.firstname = req.body.firstname;
                                                        newUser.lastname = req.body.lastname;
                                                        newUser.email = req.body.email;
                                                        newUser.role = 'user';
                                                        newUser.status = 1;
                                                        // newUser.address = req.body.address;
                                                        newUser.phone = req.body.phone;
                                                        newUser.referalcode = req.body.referalcode;

                                                        // Commented by vivek for new changes

                                                        /* if (smsdocdata.settings.twilio.mode == 'production') {
                                                             newUser.verification_code = [{ "mobile": otp.generate(secret) }];
                                                         }

                                                         newUser.name = { 'first_name': req.body.firstname, 'last_name': req.body.lastname };*/

                                                        // Commented by vivek for new changes

                                                        newUser.activity = { 'created': req.body.today, 'modified': req.body.today, 'last_login': req.body.today, 'last_logout': req.body.today };
                                                        userLibrary.userRegister({ 'newUser': newUser, 'smsdocdata': smsdocdata }, function (err, response) {
                                                            // console.log("response",response)
                                                            if (err || !response) {
                                                                res.send(err);
                                                            } else {
                                                                // if (!newUser.referalcode) {
                                                                    var data = {};
                                                                    data.user_id = response._id;
                                                                    data.user = response.firstname;
                                                                    data.email = response.email;
                                                                    data.phone = newUser.phone.number;
                                                                    data.user_type = response.role;
                                                                    data.status = response.status;
                                                                    data.token = authHeader;
                                                                    data.verification_code = response.verification_code;

                                                                    response.token = ({ username: newUser.username });
                                                                    res.send(data);
                                                                // } 
                                                                /* else {
                                                                    response.token = ({ username: newUser.username });
                                                                    res.send(response);
                                                                } */
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                // }
                            // }
                        // });
                    }
                }
            });
        });
    }

    router.taskerregister = function (req, res) {
        var username = req.body.username;
        process.nextTick(function () {
            db.GetOneDocument('tasker', { 'username': req.body.username, 'email': email }, {}, {}, function (err, user) {
                if (err) {
                    res.send(err);
                } else {
                    if (user) {
                        res.send({ message: 'That email or username is already .' });
                    } else {
                        var authHeader = jwt.sign(username, CONFIG.SECRET_KEY);

                        var newUser = new Tasker();
                        newUser.username = req.body.username;
                        newUser.email = req.body.email;
                        newUser.password = newUser.generateHash(req.body.pwd);
                        newUser.role = req.body.role;

                        newUser.save(function (err) {
                            if (err) {
                                res.send({ message: 'That email or username is already taken.' });
                            }
                            newUser.token = authHeader;
                            res.send(null, newUser);
                        });
                    }
                }
            });
        });
    }


    router.sitemap = function (req, res) {

        async.waterfall([
            function (callback) {
                db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                    callback(err, settings.settings);
                });
            },
            function (settings, callback) {
                db.GetDocument('category', { 'status': { $eq: 1 }, parent: { $exists: false } }, {}, {}, function (err, categories) {
                    callback(err, settings, categories);
                });
            }, function (settings, categories, callback) {
                db.GetDocument('pages', { 'status': { $eq: 1 } }, {}, {}, function (err, pagedata) {
                    callback(err, settings, categories, pagedata);
                });
            }
        ], function (err, settings, categories, pagedata) {

            var urls = [];
            var data = {};
            data.loc = settings.site_url;
            //data.changefreq = 'weekly';
            //data.priority = '0.8';
            urls.push(data);

            for (var i = 0; i < categories.length; i++) {
                var data = {};
                data.loc = settings.site_url + 'category/' + categories[i].slug;
                //data.lastmod = categories[i].updatedAt;
                urls.push(data);
            }

            for (var i = 0; i < pagedata.length; i++) {
                var data = {};
                data.loc = settings.site_url + 'page/' + pagedata[i].slug;
                //data.lastmod = pagedata[i].updatedAt;
                urls.push(data);
            }

            var xmlJSON = {
                urlset: {
                    '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
                    url: urls
                }
            };
            var xml = builder.create(xmlJSON, { encoding: 'utf-8' })
            res.header('Content-Type', 'application/xml');
            res.send(xml.end({ pretty: true }));
        });
    }

    return router;
};
