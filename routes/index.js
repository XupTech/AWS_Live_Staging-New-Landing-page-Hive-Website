var path = require('path');
var jwt = require('jsonwebtoken');
var CONFIG = require('../config/config');
var db = require('../model/mongodb.js');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var User123 = require('../model/mongodb.js').users;
var mailcontent = require('../model/mailcontent.js');
var library = require('../model/library.js');
var base64url = require('base64url');
var jwt = require('jsonwebtoken');

function jwtSign(payload) {
    var token = jwt.sign(payload, CONFIG.SECRET_KEY);
    return token;
}

module.exports = function (app, passport, io) {

    try {

        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            done(null, { id: user.id });
        });

        passport.use(new FacebookStrategy({
            clientID: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.facebookAuth.callbackURL,
            profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
        }, function (req, token, refreshToken, profile, done) {

            process.nextTick(function () {
                var usernamecheck = profile.name.givenName + profile.name.familyName;


                    console.log("UUUUSSSSEEEERRRR",User123)
                    db.GetOneDocument('users',{ $or: [{ 'username': usernamecheck }, { 'email': profile.emails[0].value }] }, {} , {} , function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    var authHeader = jwt.sign(usernamecheck, CONFIG.SECRET_KEY);
                    if (user) {
                        if (user.status == 0) {
                            user.status = 1;
                            user.save(function (err) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else {
                                    return done(null, { "user": user, "header": authHeader });
                                }
                            });
                        } else {
                            return done(null, { "user": user, "header": authHeader }); // user found, return that user
                        }
                    } else {
                        var newUser = {};
                        newUser.username = profile.name.givenName + profile.name.familyName;
                        newUser.email = profile.emails[0].value;
                        newUser.role = 'user';
                        newUser.type = 'facebook';
                        newUser.status = 1;
                        newUser.unique_code = library.randomString(8, '#A');
                        db.InsertDocument('users', newUser, function (err, response) {
                            if (err || !response) {
                                return done(null, false, { error: err });
                            } else {
                                var mailData = {};
                                mailData.template = 'Sighnupmessage';
                                mailData.to = newUser.email;
                                mailData.html = [];
                                mailData.html.push({ name: 'name', value: newUser.username });
                                mailData.html.push({ name: 'email', value: newUser.email });
                                mailData.html.push({ name: 'referal_code', value: newUser.unique_code });
                                mailcontent.sendmail(mailData, function (err, response) { });
                                return done(null, { "user": response, "header": authHeader });
                            }
                        });
                    }
                });
            });
        }));

        //FACEBOOK - LOGIN/REGISTRATION
        passport.use('facebookUser', new FacebookStrategy({
            clientID: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.facebookAuth.callbackURL + '?type=user',
            profileFields: ['id', 'email', 'gender', 'birthday', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
        }, function(token, refreshToken, profile, done) {
            console.log("facebook login ===>", profile);
            process.nextTick(function() { 
                console.log('process nest');
                var usernamecheck = profile.name.givenName + profile.name.familyName;
               // User.findOne({ $or: [{ 'username': usernamecheck }, { 'email': profile.emails[0].value }] }, function(err, user) {
               
              /* db.DeleteDocument('users',{ $or: [{ 'username': usernamecheck }, { 'email': profile.emails[0].value }] }, {} , function (err, user) { });
                return;*/
                db.GetOneDocument('users',{ $or: [{ 'username': usernamecheck }, { 'email': profile.emails[0].value }] }, {} , {} , function (err, user) {
                    if (err) {

                        return done(err);
                    }
                    var authHeader = jwtSign({ username: profile.username });
                    if (user) {
                        
                        console.log('user.phone.number',user.phone.number);
                        console.log('user.phone.user.facebookverify',user.facebookverify);
                        if(user.phone && user.phone.number){
                             user.socialverify = 1;
                         }else{
                            user.socialverify = 0;
                         }
                         
                        console.log('user.socialverify ',user.socialverify );
                        if (user.status == 0) {
                            user.status = 1;
                            user.save(function(err) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else if (user.facebook.token) {
                                    return done(null, { "user": user, "header": authHeader, "socialLogin": true,'socialverify':user.socialverify });
                                } else {
                                    db.findOneAndUpdate('users',{ '_id': user._id }, {
                                        facebook: {
                                            id: profile._json.id,
                                            token: token,
                                            name: profile._json.first_name + ' ' + profile._json.last_name || '',
                                            email: profile._json.email
                                        }
                                    }, function(err, update) {
                                        if (err) {
                                            return done(null, false, { error: err });
                                        } else {
                                            return done(null, { "user": user, "header": authHeader, "socialLogin": true,'socialverify':user.socialverify });
                                        }
                                    })
                                }
                            });
                        } else if (user.facebook.token) {
                            return done(null, { "user": user, "header": authHeader, "socialLogin": true,'socialverify':user.socialverify }); // user found, return that user
                        } else {
                            db.findOneAndUpdate('users',{ '_id': user._id }, {
                                facebook: {
                                    id: profile._json.id,
                                    token: token,
                                    name: profile._json.first_name + ' ' + profile._json.last_name || '',
                                    email: profile._json.email
                                }
                            }, function(err, update) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else {
                                    return done(null, { "user": user, "header": authHeader, "socialLogin": true,'socialverify':user.socialverify });
                                }
                            })
                        }
                    } else {

                        var newUser = {};
                        var userData = profile._json
                        newUser.type = 'Individual';
                        newUser.username = userData.first_name + userData.last_name || '';
                        newUser.email = userData.email || '';
                        newUser.gender = userData.gender || '';
                        newUser.username = userData.first_name || '';
                        newUser.firstname = userData.first_name || '';
                        newUser.lastname = userData.last_name || ''                    
                        newUser.birthdate = {};
                        if (userData.birthday != undefined) {
                            newUser.birthdate.year = userData.birthday.split('/')[2] || null;
                            newUser.birthdate.month = userData.birthday.split('/')[0] || null;
                            newUser.birthdate.date = userData.birthday.split('/')[1] || null;
                        } else {
                            newUser.birthdate.year = null;
                            newUser.birthdate.month = null;
                            newUser.birthdate.date = null;
                        }
                        newUser.role = 'user';
                        newUser.facebook = {
                            id: userData.id,
                            token: token,
                            name: userData.first_name + ' ' + userData.last_name || '',
                            email: userData.email
                        }
                        newUser.status = 3;
                        newUser.unique_code = library.randomString(8, '#A');

                        db.InsertDocument('users', newUser, function (err, user) {
                            console.log("test user err, user" ,err, user);
                            if (err) {
                                return done(null, false, { error: err });
                            } else {
                                var mailData = {};
                                mailData.template = 'Sighnupmessage';
                                mailData.to = newUser.email;
                                mailData.html = [];
                                mailData.html.push({ name: 'name', value: newUser.username });
                                mailData.html.push({ name: 'email', value: newUser.email });
                                mailData.html.push({ name: 'referal_code', value: newUser.unique_code });
                                mailcontent.sendmail(mailData, function(err, response) {});
                                return done(null, { "user": user, "header": authHeader, "socialLogin": true ,'socialverify':0});
                            }
                        });
                    }
                });
            });
        }));

        passport.use('facebookTasker', new FacebookStrategy({
            clientID: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.facebookAuth.callbackURL + '?type=tasker',
            profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'birthday', 'location', 'timezone', 'updated_time', 'verified']
        }, function(token, refreshToken, profile, done) {
            process.nextTick(function() {
                var usernamecheck = profile.name.givenName + profile.name.familyName;
                //Tasker.findOne({ $or: [{ 'username': usernamecheck }, { 'email': profile.emails[0].value }] }, function(err, user) {
                
                /* db.DeleteDocument('tasker',{ $or: [{ 'username': usernamecheck }, { 'email': profile.emails[0].value }] }, {} , function (err, user) { });
                return;*/
                db.GetOneDocument('tasker',{ $or: [{ 'username': usernamecheck }, { 'email': profile.emails[0].value }] }, {} , {} , function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    var authHeader = jwtSign({ username: profile.username });
                    if (user) {
                        console.log("facebookTasker === user available", user);

                         console.log('user.phone.number',user.phone.number);
                        console.log('user.phone.user.facebookverify',user.facebookverify);
                        if(user.phone && user.phone.number){
                             user.socialverify = 1;
                         }else{
                            user.socialverify = 0;
                         }

                        if (user.status == 0) {
                            user.status = 1;
                            user.registerCompleted = 1;
                            user.save(function(err) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else if (user.facebook.token) {
                                    return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify });
                                } else {
                                    //Tasker.updateOne({ '_id': user._id }, {
                                        db.findOneAndUpdate('tasker',{ '_id': user._id }, {
                                        facebook: {
                                            id: profile._json.id,
                                            token: token,
                                            name: profile._json.first_name + ' ' + profile._json.last_name || '',
                                            email: profile._json.email
                                        }
                                    }, function(err, update) {
                                        if (err) {
                                            return done(null, false, { error: err });
                                        } else {
                                            return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify });
                                        }
                                    })
                                }
                            });
                        } else if (user.status == 3) {
                            user.registerCompleted = 3;
                            return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify }); // user found, return that user

                         } else if (user.status == 4) {
                            user.registerCompleted = 4;
                            return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify }); // user found, return that user
                        }
                         else {
                            //Tasker.updateOne({ '_id': user._id }, {
                            db.findOneAndUpdate('tasker',{ '_id': user._id }, {
                                facebook: {
                                    id: profile._json.id,
                                    token: token,
                                    name: profile._json.first_name + ' ' + profile._json.last_name || '',
                                    email: profile._json.email
                                }
                            }, function(err, update) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else {
                                    return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify });
                                }
                            })
                        }
                    } else {
                        console.log("facebookTasker === user available", user);

                       // var newUser = new Tasker();
                        var newUser = {};
                        var taskerData = profile._json
                        console.log("profile ===>", profile);
                        console.log("taskerData ===>", taskerData);
                        newUser.username = taskerData.first_name + taskerData.last_name || '';
                        newUser.email = taskerData.email || '';
                        newUser.gender = taskerData.gender || '';
                       // newUser.name.first_name = taskerData.first_name || '';
                        //newUser.name.last_name = taskerData.last_name || '';
                        newUser.role = 'tasker';
                        newUser.facebook = {
                            id: taskerData.id,
                            token: token,
                            name: taskerData.first_name + ' ' + taskerData.last_name || '',
                            email: taskerData.email
                        }
                        newUser.status = 3;
                        newUser.name = {};
                        newUser.name.first_name = taskerData.first_name || '';
                        newUser.name.last_name = taskerData.last_name || '';
                        newUser.birthdate = {};
                        if (taskerData.birthday != undefined) {
                            newUser.birthdate.year = taskerData.birthday.split('/')[2] || null;
                            newUser.birthdate.month = taskerData.birthday.split('/')[0] || null;
                            newUser.birthdate.date = taskerData.birthday.split('/')[1] || null;
                        } else {
                            newUser.birthdate.year = null;
                            newUser.birthdate.month = null;
                            newUser.birthdate.date = null;
                        }
                        newUser.unique_code = library.randomString(8, '#A');
                        newUser.registerCompleted = 0;
                        console.log('callback to tasker');

                        return done(null, { "user": newUser, "header": authHeader,'socialverify':0 });
                        /* newUser.save(function (err) {
                            if (err) {
                                return done(null, false, { error: err });
                            }
                            else {
                                var mailData = {};
                                mailData.template = 'Sighnupmessage';
                                mailData.to = newUser.email;
                                mailData.html = [];
                                mailData.html.push({ name: 'name', value: newUser.username });
                                mailData.html.push({ name: 'email', value: newUser.email });
                                mailData.html.push({ name: 'referal_code', value: newUser.unique_code });
                                mailcontent.sendmail(mailData, function (err, response) { });
                                return done(null, { "user": newUser, "header": authHeader });
                            }
                        }); */
                    }
                });
            });
        }));
        //FACEBOOK - LOGIN/REGISTRATION


        //GOOGLE -LOGIN/REGISTRATION
        passport.use('googleForUser', new GoogleStrategy({
            clientID: CONFIG.SOCIAL_NETWORKS.googleAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.googleAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.googleAuth.callbackURL,
            passReqToCallback: true,
            profileFields: ['id', 'emails', 'gender', 'birthday']
        }, function(req, token, refreshToken, profile, done) {

            process.nextTick(function() {
                var usernamecheck = profile._json.given_name + profile._json.family_name;
                //User.findOne({ $or: [{ 'username': usernamecheck }, { 'email': profile.emails[0].value }] }, function(err, user) {
    /*              db.DeleteDocument('users',{ $or: [{ 'username': usernamecheck }, { 'email': profile._json.email }] }, {} , function (err, user) { });
                return;*/
                 db.GetOneDocument('users',{ $or: [{ 'username': usernamecheck }, { 'email': profile._json.email }] }, {} , {} , function (err, user) {
                    if (err) {

                        return done(err);
                    }
                    var authHeader = jwtSign({ username: profile.username });
                    if (user) {
                        if(user.phone && user.phone.number){
                             user.socialverify = 1;
                         }else{
                            user.socialverify = 0;
                         }

                        if (user.status == 0) {
                            user.status = 1;
                            user.save(function(err) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else if (user.google.token) {
                                    return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify });
                                } else {
                                   db.findOneAndUpdate('users',{ '_id': user._id }, {
                                        google: {
                                            id: profile._json.id,
                                            token: token,
                                            name: profile._json.displayName || '',
                                            email: profile._json.email
                                        }
                                    }, function(err, update) {
                                        if (err) {
                                            return done(null, false, { error: err });
                                        } else {
                                            return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify });
                                        }
                                    })
                                }
                            });
                        } else if (user.google.token) {
                            return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify }); // user found, return that user
                        } else {
                            db.findOneAndUpdate('users',{ '_id': user._id }, {
                                google: {
                                    id: profile._json.id,
                                    token: token,
                                    name: profile._json.displayName || '',
                                    email: profile._json.email
                                }
                            }, function(err, update) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else {
                                    return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify });
                                }
                            })
                        }
                    } else {
                        //var newUser = new User();
                        var newUser = {};
                        var userData = profile._json;
                        console.log('userData ===>',userData);
                        newUser.type = 'Individual';
                        newUser.username = userData.display_name || userData.given_name ||  '';
                        newUser.email = userData.email|| '';
                        newUser.firstname = userData.display_name || userData.given_name ||  '';
                        newUser.lastname = userData.given_name || ''    
                       /* newUser.name = {};
                        newUser.name.first_name = userData.family_name || '';
                        newUser.name.last_name = userData.given_name || '';*/
                        newUser.role = 'user';
                        newUser.google = {
                            id: userData.id,
                            token: token,
                            name: userData.display_name || '',
                            email: userData.email || ''
                        }
                        newUser.status = 3;
                        newUser.unique_code = library.randomString(8, '#A');

                       console.log('newUser ====>',newUser);
                       db.InsertDocument('users', newUser, function (err, user) {
                        console.log('err, user',err, user);
                            if (err) {
                                return done(null, false, { error: err });
                            } else {
                                var mailData = {};
                                mailData.template = 'Sighnupmessage';
                                mailData.to = newUser.email;
                                mailData.html = [];
                                mailData.html.push({ name: 'name', value: newUser.username });
                                mailData.html.push({ name: 'email', value: newUser.email });
                                mailData.html.push({ name: 'referal_code', value: newUser.unique_code });
                                mailcontent.sendmail(mailData, function(err, response) {});

                                return done(null, { "user": user, "header": authHeader,'socialverify':0 });
                            }
                        });
                    }
                });
            });
        }));

        passport.use('googleForTasker', new GoogleStrategy({
            clientID: CONFIG.SOCIAL_NETWORKS.googleAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.googleAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.googleAuth.callbackURL,
            passReqToCallback: true,
            profileFields: ['id', 'email', 'gender', 'birthday']
        }, function(req, token, refreshToken, profile, done) {

            console.log("tasker _id");

            process.nextTick(function() {
                //var usernamecheck = profile.name.givenName + profile.name.familyName;
                var usernamecheck = profile._json.given_name + profile._json.family_name;
                //Tasker.findOne({ $or: [{ 'username': usernamecheck }, { 'email': profile.emails[0].value }] }, function(err, user) {
                 db.GetOneDocument('tasker',{ $or: [{ 'username': usernamecheck }, { 'email': profile._json.email }] }, {} , {} , function (err, user) { 
                 console.log("user", user); 
                    if (err) {
                        return done(err);
                    }

                    var authHeader = jwtSign({ username: profile.username });
                    if (user) {

                        if(user.phone && user.phone.number){
                             user.socialverify = 1;
                         }else{
                            user.socialverify = 0;
                         }

                        if (user.status == 1) {
                            user.status = 1;
                            user.registerCompleted = 1;
                            user.save(function(err) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else if (user.google.token) {
                                    return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify });
                                } else {
                                    //Tasker.updateOne({ '_id': user._id }, {
                                     db.findOneAndUpdate('tasker',{ '_id': user._id }, {
                                        google: {
                                            id: profile._json.id,
                                            token: token,
                                            name: profile._json.display_name || '',
                                            email: profile._json.email || ''
                                        }
                                    }, function(err, update) {
                                        if (err) {
                                            return done(null, false, { error: err });
                                        } else {
                                            return done(null, { "user": user, "header": authHeader });
                                        }
                                    })
                                }
                            });
                        } else if (user.status == 3) {
                            user.registerCompleted = 3;
                            return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify }); // user found, return that user
                        } else if (user.status == 4) {
                            user.registerCompleted = 4;
                            return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify }); // user found, return that user
                        } else {
                            //Tasker.updateOne({ '_id': user._id }, {
                             db.findOneAndUpdate('tasker',{ '_id': user._id }, {
                                google: {
                                    id: profile._json.id,
                                    token: token,
                                    name: profile._json.display_name || '',
                                    email: profile._json.email || ''
                                }
                            }, function(err, update) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else {
                                    return done(null, { "user": user, "header": authHeader,'socialverify':user.socialverify });
                                }
                            })
                        }
                    } else {

                        //var newUser = new Tasker();
                        var newUser = {};
                        var taskerData = profile._json;
                        //newUser.username = taskerData.displayName || '';
                        newUser.username = taskerData.display_name || taskerData.given_name ||  '';
                        newUser.email = taskerData.email|| '';
                        newUser.firstname = taskerData.display_name || taskerData.given_name ||  '';
                        newUser.lastname = taskerData.given_name || ''    
                        newUser.email = taskerData.email || '';
                        newUser.role = 'tasker';
                        newUser.google = {
                            id: taskerData.id,
                            token: token,
                            name: taskerData.displayName || '',
                            email: taskerData.email || ''
                        }
                        newUser.status = 3;
                       /* newUser.name = {};
                        newUser.name.first_name = taskerData.name.familyName || '';
                        newUser.name.last_name = taskerData.name.givenName || '';*/
                        newUser.unique_code = library.randomString(8, '#A');
                        newUser.registerCompleted = 0;

                        /* newUser.save(function (err) {
                            if (err) {
                                return done(null, false, { error: err });
                            }
                            else {
                                var mailData = {};
                                mailData.template = 'Sighnupmessage';
                                mailData.to = newUser.email;
                                mailData.html = [];
                                mailData.html.push({ name: 'name', value: newUser.username });
                                mailData.html.push({ name: 'email', value: newUser.email });
                                mailData.html.push({ name: 'referal_code', value: newUser.unique_code });
                                mailcontent.sendmail(mailData, function (err, response) { });

                                console.log('=========> authHeader',authHeader);
                                return done(null, { "user": newUser, "header": authHeader });
                            }
                        }); */

                        return done(null, { "user": newUser, "header": authHeader,'socialverify':0 });
                    }
                });
            });
        }));
        //GOOGLE - LOGIN/REGISTRATION

        app.get('/admin', function (req, res) {
            db.GetOneDocument('settings', { "alias": "general" }, {}, {}, function (err, docdata) {
                // if (err) {
                //     res.send(err);
                // } else {
                    var settings = {};
                    settings.googleMapAPI = docdata && docdata.settings.map_api ? docdata.settings.map_api : '';
                    res.render('admin/layout', settings);
                //}
            });
        });

        app.get('/auth/facebook', passport.authenticate('facebook', { scope: ["email", "user_location"] }));

        /*app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect: '/auth/success',
                failureRedirect: '/auth/failure',
                failureFlash: true
            }));*/

        //Facebook & Google Authentication
        app.get('/auth/facebook/typeuser', passport.authenticate('facebookUser', { scope: ["email" ],state: base64url(JSON.stringify({type: 'user'}))  }));
        app.get('/auth/facebook/typetasker', passport.authenticate('facebookTasker', { scope: ["email" ],state: base64url(JSON.stringify({type: 'tasker'}))  }));

        app.get('/auth/facebook/callback',
            function(req, res, next){
                var userCheck = JSON.parse(base64url.decode(req.query.state));
                console.log("userCheck.type",userCheck.type);
                if(userCheck.type == 'user'){
                    passport.authenticate('facebookUser', {
                    successRedirect: '/auth/success',
                    failureRedirect: '/auth/failure',
                    failureFlash: true
                    })(req, res, next)
                } else if(userCheck.type == 'tasker'){
                    passport.authenticate('facebookTasker', {
                    successRedirect: '/auth/success',
                    failureRedirect: '/auth/failure',
                    failureFlash: true
                    })(req, res, next)
                }
            }
        );

         app.get('/auth/google/typeuser', passport.authenticate('googleForUser', { scope: ["profile", "email"], state: base64url(JSON.stringify({type: 'user'})) }));
         app.get('/auth/google/typetasker', passport.authenticate('googleForTasker', { scope: ["profile", "email"], state: base64url(JSON.stringify({type: 'tasker'})) }));    
         app.get('/auth/google/callback',
            function(req, res, next){
                var userCheck = JSON.parse(base64url.decode(req.query.state));
                console.log('userCheck',userCheck);
                if(userCheck.type == 'user'){
                    passport.authenticate('googleForUser', {
                    successRedirect: '/auth/success',
                    failureRedirect: '/auth/failure',
                    failureFlash: true
                    })(req, res, next)
                } else if(userCheck.type == 'tasker'){
                    passport.authenticate('googleForTasker', {
                    successRedirect: '/auth/success',
                    failureRedirect: '/auth/failure',
                    failureFlash: true
                    })(req, res, next)
                }
            }
        );


        app.get('/auth/success', function (req, res) {
            global.name = req.session.passport.user.user._id;
            if (!req.session.passport.user.user.role) {
                req.session.passport.user.user.role = "user"
            }

            console.log('req.session.passport.user.socialverify',req.session.passport.user.socialverify);
             if (req.session.passport.user.socialverify && req.session.passport.user.socialverify == 1) {
                console.log('web if');
                req.session.passport.user.socialverify = 1
            }else{
                console.log('web else');
                req.session.passport.user.socialverify = 0;
            }
            res.cookie('username', req.session.passport.header);
            console.log("req.session.passport.req.session.passport",req.session.passport.user)

            if(req.session.passport.user.user.role && req.session.passport.user.user.role == 'tasker'){
                if(req.session.passport.user.socialverify == 1 ){
                     res.render('site/after_auth', {
                    username: req.session.passport.user.user.username, email: req.session.passport.user.user.email, role: req.session.passport.user.user.role, token: req.session.passport.user.header,
                    socialverify: req.session.passport.user.socialverify,_id: req.session.passport.user.user._id
                });
                }else{      
                    if(req.session.passport.user.user.firstname){
                           var first_name =  req.session.passport.user.user.firstname;
                    }else{
                         var first_name =  req.session.passport.user.user.name.first_name ;
                    }
                    if(req.session.passport.user.user.lastname){
                           var lastname =  req.session.passport.user.user.lastname;
                    }else{
                         var lastname =  req.session.passport.user.user.name.first_name ;
                    }

                     res.render('site/after_auth', {
                    username: req.session.passport.user.user.username, email: req.session.passport.user.user.email,first_name:first_name ,last_name: lastname, role: req.session.passport.user.user.role, token: req.session.passport.user.header,socialverify: req.session.passport.user.socialverify
                });
             }
               
            }else{
                res.render('site/after_auth', {
                username: req.session.passport.user.user.username, email: req.session.passport.user.user.email, _id: req.session.passport.user.user._id, role: req.session.passport.user.user.role, token: req.session.passport.user.header,
                avatar: req.session.passport.user.user.avatar, socialverify: req.session.passport.user.socialverify,userid: req.session.passport.user.user._id
            });

            }            

        });


        app.get('/auth/failure', function (req, res) {
            res.render('site/auth_fail', { err: req.session.flash });
        });

        app.get('/site-success', function (req, res) {
            global.name = req.session.passport.user._id;
            res.cookie('username', req.session.passport.user.header || req.session.passport.user.user.token);
            res.send({ user: req.session.passport.user.user.username, email: req.session.passport.user.user.email, user_id: req.session.passport.user.user._id, token: req.session.passport.user.header, user_type: req.session.passport.user.user.role, tasker_status: req.session.passport.user.user.tasker_status, status: req.session.passport.user.user.status, verification_code: req.session.passport.user.user.verification_code, phone: req.session.passport.user.user.phone.number });
        });

        app.get('/site-failure', function (req, res) {
            if (req.session.flash.Error) {
                var error = req.session.flash.Error[0];
            } else if (req.session.flash.error) {
                var error = req.session.flash.error[0];
            }
            req.session.destroy(function (err) {
                res.send(error);
            });
        });

        app.post('/site-logout', function (req, res) {

            var roles = req.body.currentUser.user_type;
            var userid = req.body.currentUser.user_id;
            var model = (roles == 'user')

            if (roles == 'user') {
                model = 'users'
            } else if (roles == 'tasker') {
                model = 'tasker'
            }
            db.UpdateDocument(model, { '_id': userid }, { 'activity.last_logout': new Date() }, {}, function (err, response) {
                req.session.destroy(function (err) {
                    res.send('success');
                });
            });
        });

        app.post('/facebookregister', passport.authenticate('facebooksite-register', {
            successRedirect: '/site-success',
            failureRedirect: '/site-failure',
            failureFlash: true
        }));

        if (CONFIG.MOBILE_API) {
            var mobile = require('../routes/mobile.js')(app, io);
        }

        var site = require('../routes/site.js')(app, io);
        var admin = require('../routes/admin.js')(app, io);

        app.get('/*', function (req, res) {
            db.GetDocument('settings', { 'alias': ['seo', 'general'] }, {}, {}, function (err, docdata) {
                if (err) {
                    res.send(err);
                } else {

                    var settings = {};
                    settings.title = docdata[1].settings.seo_title;
                    settings.description = docdata[1].settings.meta_description;
                    settings.image = GLOBAL_CONFIG.logo;
                    settings.siteUrl = GLOBAL_CONFIG.site_url;
                    settings.fbappId = CONFIG.SOCIAL_NETWORKS.facebookAuth.clientID;
                    settings.googleMapAPI = docdata[0].settings.map_api ? docdata[0].settings.map_api : '';
                    settings.gaTrackingID = docdata[1].settings.webmaster.google_analytics;
                    res.render('site/layout', settings);

                }
            });
        });
    } catch (e) {
        console.log('Error in Router', e);
    }

};
