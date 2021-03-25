module.exports = function (app, io) {

    var db = require('../../model/mongodb.js');
    var bcrypt = require('bcrypt-nodejs');
    var attachment = require('../../model/attachments.js');
    var CONFIG = require('../../config/config');
    var mail = require('../../model/mail.js');
    var mailcontent = require('../../model/mailcontent.js');
    var mongoose = require('mongoose');
    var async = require("async");
    var library = require('../../model/library.js');
    var taskerLibrary = require('../../model/tasker.js')(io);
    var push = require('../../model/pushNotification.js')(io);
    var moment = require("moment");


    var router = {};

    router.getpendinglist = function (req, res) {
        db.GetDocument('tasker', { status: { $eq: 3 } }, {}, {}, function (err, shops) {
            if (err) {
                res.send(err);
            } else {
                res.send(shops);
            }
        });
    };

    router.updatetaskerstatus = function (req, res) {
        if (req.body.status == 2 || req.body.status == 3) {
            var status = 1;
            var doc_status = 1;
        } else {
            var status = 2;
            var doc_status = 2;
        }

        db.GetDocument('tasker', { _id: req.body.id }, {}, {}, function (err, tasker) {
            if (err) {
                res.send(err);
            } else {
                /*if(!tasker[0].stripe) {
                    res.send('Stripe Not Added');
                } else {*/
                db.UpdateDocument('tasker', { _id: req.body.id }, { status: status, document_status: doc_status }, function (err, updatedata) {
                    if (err) {
                        res.send(err);
                    } else {
                        var message = '';
                        var key = {};
                        if (status == 1) {
                            message = 'Your account status is changed to Verified';
                            key = { 'key': 1, 'taskerdata': tasker };
                            push.sendPushnotification(req.body.id, message, 'account_status', 'ANDROID', key, 'PROVIDER', function (err, response, body) { });
                        } else {
                            db.UpdateDocument('tasker', { _id: req.body._id }, { 'device_info.device_token': '' }, {}, function (err, docdata) {
                                if (err) {
                                    res.send(err);
                                } else {
                                    message = 'Your account status is changed to Unverified';
                                    key = { 'key': 2, 'taskerdata': tasker };
                                    push.sendPushnotification(req.body.id, message, 'account_status', 'ANDROID', key, 'PROVIDER', function (err, response, body) { });
                                }
                            });
                        }

                        res.send(updatedata);
                    }
                });
                //}
            }
        });
    };



    router.checktaskerphoneno = function (req, res) {

        db.GetOneDocument('tasker', { "phone.code": req.body.data.phone.code, "phone.number": req.body.data.phone.number }, { phone: 1 }, {}, function (err, pdocdata) {
            if (err) {
                res.send(err);
            } else {
                if (pdocdata != null) {
                    res.send({ msg: 'Phone Number Already Exists' });
                } else {
                    db.GetOneDocument('tasker', { 'email': req.body.data.email }, {}, {}, function (err, taskeremail) {

                        if (err) {
                            res.send(err);
                        } else {
                            if (taskeremail) {
                                res.send({ msg: 'Email Id Already Exists' });
                            } else {
                                res.send({ msg: 'success' });
                            }
                        }
                    });
                }
            }
        });

    };

    router.getusers = function (req, res) {
        db.GetDocument('users', {}, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };

    router.currentUser = function (req, res) {
        req.checkBody('currentUserData', 'Invalid currentUserData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        db.GetDocument('users', {
            username: req.body.currentUserData
        }, { username: 1 }, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };

    router.save = function (req, res) {

        var data = {
            activity: {}
        };
        /*   if (req.file) {
               data.avatar = req.file.destination + req.file.filename;
           }*/
        /*  req.checkBody('username', 'Invalid username').notEmpty();
             req.checkBody('name', 'Invalid name').notEmpty();
             req.checkBody('gender', 'Invalid gender').notEmpty();
             req.checkBody('about', 'Invalid about').notEmpty();
             req.checkBody('phone_no', 'Invalid phone_no').notEmpty();
             req.checkBody('email', 'Invalid email').notEmpty();
             req.checkBody('role', 'Invalid role').notEmpty();
             req.checkBody('address', 'Invalid address').notEmpty();
             req.checkBody('status', 'Invalid status').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                res.send(errors, 400);
                return;
            }*/

        data.name = req.body.name;
        data.birthdate = req.body.birthdate;
        data.firstname = req.body.firstname;
        data.lastname = req.body.lastname;
        data.username = req.body.username;
        data.gender = req.body.gender;
        data.phone = req.body.phone;
        data.email = req.body.email.toLowerCase();
        data.role = req.body.role;
        data.address = req.body.address;
        data.status = req.body.status;
        data.availability_address = req.body.availability_address;
        data.avatarBase64 = req.body.avatarBase64;
        data.avatar = req.body.avatar;
        data.document_status = req.body.document_status;

        if (data.avatarBase64) {
            var base64 = data.avatarBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            var fileName = Date.now().toString() + '.png';
            var file = './uploads/images/tasker/' + fileName;
            library.base64Upload({ file: file, base64: base64[2] }, function (err, response) { });
            data.avatar = 'uploads/images/tasker/' + fileName;
            data.img_name = fileName;
            data.img_path = 'uploads/images/tasker/';
        }
        /*    if (req.file) {
                req.body.avatar = attachment.get_attachment(req.file.destination, req.file.filename);
            }
            */

        if (req.body._id) {
            db.GetDocument('tasker', { "phone.code": data.phone.code, "phone.number": data.phone.number }, {}, {}, function (err, pdocdata) {
                if (err) {
                    res.send(err);
                } else {
                    if ((pdocdata.length != 0) && (pdocdata.length < 2) && (pdocdata[0]._id.toString() != req.body._id.toString())) {
                        res.send({ msg: 'Phone Number Already Exists' });
                    }
                    else {
                        db.GetDocument('tasker', { 'email': data.email }, {}, {}, function (err, tasker) {
                            if (err) {
                                res.send(err);
                            } else {
                                if ((tasker.length != 0) && (tasker.length < 2) && (tasker[0]._id.toString() != req.body._id.toString())) {
                                    res.send({ msg: 'Email Already Exists' });
                                } else {
                                    db.UpdateDocument('tasker', { _id: req.body._id }, data, {}, function (err, docdata) {
                                        if (err) {
                                            res.send(err);
                                        } else {
                                            db.GetDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                                                if (err) {
                                                    res.send(err);
                                                } else {
                                                    var name;
                                                    var message = '';

                                                    if (req.body.name) {
                                                        name = req.body.name.first_name + " (" + req.body.username + ")";
                                                    } else {
                                                        name = req.body.username;
                                                    }

                                                    if (pdocdata[0].status == data.status) {
                                                        var key = { 'key': 1, 'userdata': data };
                                                        message = 'Admin has updated your profile';
                                                        push.sendPushnotification(req.body._id, message, 'admin_notification', 'ANDROID', key, 'PROVIDER', function (err, response, body) { });
                                                    } else {
                                                        if (req.body.status == 1) {
                                                            var key = { 'key': 1, 'userdata': data };
                                                            message = 'Your account status is changed to Verified';
                                                            push.sendPushnotification(req.body._id, message, 'account_status', 'ANDROID', key, 'PROVIDER', function (err, response, body) { });
                                                        } else if (req.body.status == 2) {
                                                            db.UpdateDocument('tasker', { _id: req.body._id }, { 'device_info.device_token': '' }, {}, function (err, docdata) {
                                                                if (err) {
                                                                    res.send(err);
                                                                } else {
                                                                    var key = { 'key': 2, 'userdata': data };
                                                                    message = 'Your account status is changed to Unverified';
                                                                    push.sendPushnotification(req.body._id, message, 'account_status', 'ANDROID', key, 'PROVIDER', function (err, response, body) { });
                                                                }
                                                            });

                                                        } else {
                                                            var key = { 'key': 3, 'userdata': data };
                                                            message = 'Your account status is changed to Pending';
                                                            push.sendPushnotification(req.body._id, message, 'account_status', 'ANDROID', key, 'PROVIDER', function (err, response, body) { });
                                                        }

                                                    }

                                                    if (req.body.status == 1) {
                                                        var mailData = {};
                                                        mailData.template = 'Profileapprovel';
                                                        mailData.to = req.body.email;
                                                        mailData.language = pdocdata[0].language;
                                                        mailData.html = [];
                                                        mailData.html.push({ name: 'taskername', value: data.username });
                                                        mailcontent.sendmail(mailData, function (err, response) { });
                                                    } else {
                                                        var mailData = {};
                                                        mailData.template = 'UnverfiedAccount';
                                                        mailData.to = req.body.email;
                                                        mailData.language = pdocdata[0].language;
                                                        mailData.html = [];
                                                        mailData.html.push({ name: 'taskername', value: data.username });
                                                        mailcontent.sendmail(mailData, function (err, response) { });
                                                    }
                                                }
                                            });
                                            //res.send(docdata);
                                            res.send({ msg: 'success', data: docdata });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });

        } else {
            data.activity.created = new Date();
            data.status = 1;
            db.InsertDocument('users', data, function (err, result) {
                if (err) {

                    res.send(err);
                } else {

                    res.send(result);
                }
            });
        }
    }


    router.savepassword = function (req, res) {
        console.log("11145544121441", req.body)
        /*  db.GetOneDocument('tasker', { _id: req.body._id }, { password: 1 }, {}, function (err, docdata) {

              if (err) {
                  res.send(err);
              } else {

                  bcrypt.compare(req.body.pass, docdata.password, function (err, result) {

                      if (result == true) {
                          req.body.password = bcrypt.hashSync(req.body.new_confirmed, bcrypt.genSaltSync(8), null);

                          db.UpdateDocument('tasker', { _id: req.body._id }, req.body, function (err, docdata) {

                              if (err) {
                                  res.send(err);
                              } else {
                                  res.send(docdata);
                              }
                          });
                      } else {
                          res.status(400).send("Current password is wrong");
                      }
                  });
              }
          });*/
        db.GetOneDocument('tasker', { _id: req.body._id }, { password: 1 }, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                bcrypt.compare(req.body.newpassword, docdata.password, function (err, result) {
                    if (result == true) {
                        res.send({ message: "Not allowing you to add Same Password" });
                    }
                    else {
                        if (req.body.newpassword == req.body.new_confirmed) {
                            req.body.password = bcrypt.hashSync(req.body.new_confirmed, bcrypt.genSaltSync(8), null);
                            db.UpdateDocument('tasker', { _id: req.body._id }, req.body, function (err, docdata) {
                                if (err) { res.send(err); }
                                else { res.send(docdata); }
                            });
                        }
                        else { res.status(400).send({ message: "Confirm password is not Match" }); }


                    }
                });
            }
        });
    }





    router.saveNewTaskerPassword = function (req, res) {
        var data = {
            activity: {}
        };

        /*  req.checkBody('password', 'Invalid password').notEmpty();
          req.checkBody('conformpassword', 'Invalid conformpassword').notEmpty();

          var errors = req.validationErrors();
          if (errors) {
              res.send(errors, 400);
              return;
          }*/

        data.password = req.body.password;
        data.conformpassword = req.body.conformpassword;

        if (req.body.conformpassword) {
            data.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
        }
        data.activity.created = new Date();
        data.status = 1;
        //  db.InsertDocument('users',data, function (err, result) {
        db.UpdateDocument('tasker', { _id: req.body._id }, data, {}, function (err, result) {
            if (err) {
                res.send(err);

            } else {
                res.send(result);

            }
        });
    }


    router.savetaskerprofile = function savetaskerprofilepassword(req, res) {

        /*    var data ={};
            var profile_details=[];
            data.profile_details =req.body.profile_details;*/
        db.UpdateDocument('tasker', { _id: req.body._id }, { 'profile_details': req.body.profile_details }, {}, function (err, result) {

            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    }
    router.saveprof = function (req, res) {
        db.UpdateDocument('tasker', { _id: req.body._id }, { 'profile_details': req.body.profile_details }, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    }

    router.edit = function (req, res) {
        db.GetDocument('tasker', { _id: req.body.id }, {}, {}, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                if (!data[0].avatar) {
                    data[0].avatar = './' + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                }
                res.send(data);
            }
        });
    };

    router.taskerDocumentEdit = function (req, res) {
        var data = {};
        data.response = {};
        var imagedata = {};
        if (req.files && req.files.length > 0) {
            var files = req.files.map(file => {
                return {
                    name: req.body.doc_name,
                    path: `uploads/images/tasker/documents/${file.filename}`,
                    file_type: file.mimetype
                }
            })

            db.UpdateDocument('tasker', { _id: req.body.tasker, 'doc._id': new mongoose.Types.ObjectId(req.body.doc_id) }, { $set: { "doc.$": files } }, { multi: true }, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send("Success");
                }
            });
        }
    }

    router.taskerDocumentUpload = function (req, res) {
        var data = {};
        data.response = {};
        var imagedata = {};
        if (req.files && req.files.length > 0) {
            var files = req.files.map(file => {
                return {
                    name: file.fieldname,
                    path: `uploads/images/tasker/documents/${file.filename}`,
                    file_type: file.mimetype
                }
            })
            data.status = '1';
            data.response.document = files;
            data.response.message = res.__("Success");
            res.send(data);
        } else {
            data.status = '0';
            data.response.image = '';
            data.response.message = res.__("Failed");
            res.send(data);
        }
    }

    router.taskerDocuments = function (req, res) {

        db.GetDocument('tasker_documents', { status: 1 }, {}, {}, function (err, docdata) {
            if (err || docdata.length <= 0) {
                //res.send([0, 0]);
                res.send(err);
            } else {
                res.send(docdata);
                //res.send([docdata[0].documentData, docdata[0].count]);
            }
        });
    }

    router.stripeConnect = function (req, res) {

        var data = {};
        data.status = 0;

        var taskerDate = {};
        taskerDate.tasker = req.body.tasker;
        taskerDate.ip = req.connection.remoteAddress;

        taskerLibrary.connectStripe(taskerDate, function (err, response) {
            if (err || !response) {
                res.send(data);
            } else {
                data.status = 1;
                data.stripe = response.id;
                res.send(data);
            }
        });
    };

    router.addtasker = function (req, res) {

        console.log("req.body", req.body);

        if (req.body.avatar) {
            var avatar = req.body.avatar;
        }

        if (avatar) {
            var base64 = avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            var fileName = Date.now().toString() + '.png';
            var file = './uploads/images/tasker/' + fileName;
            library.base64Upload({ file: file, base64: base64[2] }, function (err, response) { });
            req.body.avatar = 'uploads/images/tasker/' + fileName;
            req.body.img_name = fileName;
            req.body.img_path = 'uploads/images/tasker/';
            var test = 'uploads/images/tasker/' + fileName;
        }


        /* req.body = JSON.parse(req.body.tdata);
         if (req.file) {
             req.body.avatar = req.file.destination + req.file.filename;
         }
    */
        if (req.body.conformpassword) {
            req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
        }

        req.body.status = 1;


        /* if (req.file) {
             req.body.avatar = "";
         }*/
        /*  var data = {};
          data.name           = req.body.name;
          data.birthdate      = req.body.birthdate;
          data.username       = req.body.username;
          data.gender         = req.body.gender;
          data.phone          = req.body.phone;
          data.email          = req.body.email;
          data.role           = req.body.role;
          data.address        = req.body.address;*/

        /*if (req.file) {
            data.avatar = req.file.destination + req.file.originalname;
        }
        if (req.file) {
            req.body.avatar = attachment.get_attachment(req.file.destination, req.file.filename);
        }*/

        //data.password = req.body.password;
        //data.conformpassword = req.body.conformpassword;

        /* if (req.body.conformpassword) {
             data.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
         }
         data.activity = {};
         data.activity.created = new Date();
         data.status = 1;
         //data.profile_details = [];
         data.profile_details = req.body.profile_details;
         data.taskerskills = [];
         data.taskerskills.push(req.body.category);

        */
        //data.working_area     = req.body.working_area;
        //data.working_days    = req.body.working_days;
        //user.working_area = req.body.working_area;
        //user.working_days = req.body.working_days;
        //data.working_days = user.working_days.filter(function (n) { return n != undefined });

        //res.send(req.body);
        /*db.InsertDocument('tasker', data, function (err, result) {

                if (err) {
                    res.send(err);
                } else {

                    res.send(result);
                }
            });
        };*/
        /*router.addtasker = function (req, res) {
            var data = {};
            data.name = req.body.name;
            data.birthdate = req.body.birthdate;
            data.username = req.body.username;
            data.gender = req.body.gender;
            data.phone = req.body.phone;
            data.email = req.body.email;
            data.role = req.body.role;
            data.address = req.body.address;
            if (req.file) {
                data.avatar = req.file.destination + req.file.originalname;
            }

            if (req.file) {
                req.body.avatar = attachment.get_attachment(req.file.destination, req.file.filename);
            }

            db.InsertDocument('tasker', data, function (err, result) {

                if (err) {
                    res.send(err);
                } else {
                    res.send(result);
                }
            });*/
        db.InsertDocument('tasker', req.body, function (err, result) {

            if (err) {

                res.send(err);
            } else {

                res.send(result);
            }
        });
    };

    router.allTaskers = function getusers(req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.query.sort != "") {
            var sorted = req.query.sort;
        }
        var usersQuery = [{
            "$match": { status: { $ne: 0 } }
        }, {
            $project: {
                username: 1,
                email: 1,
                dname: { $toLower: '$' + sorted },
                activity: 1,
                status: 1

            }
        }, {
            $project: {
                username: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];
        var sorting = {};
        var searchs = '';
        if (Object.keys(req.query).length != 0) {
            usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
            if (req.query.search != '' && req.query.search != 'undefined' && req.query.search) {
                searchs = req.query.search;
                usersQuery.push({
                    "$match": {
                        $or: [
                            { "documentData.username": { $regex: searchs + '.*', $options: 'si' } },
                            { "documentData.email": { $regex: searchs + '.*', $options: 'si' } }

                        ]
                    }
                });
            }
            if (req.query.sort !== '' && req.query.sort) {
                sorting = {};
                if (req.query.status == 'false') {
                    sorting["documentData.dname"] = -1;
                    usersQuery.push({ $sort: sorting });
                } else {
                    sorting["documentData.dname"] = 1;
                    usersQuery.push({ $sort: sorting });
                }
            }
            if (req.query.limit != 'undefined' && req.query.skip != 'undefined') {
                usersQuery.push({ '$skip': parseInt(req.query.skip) }, { '$limit': parseInt(req.query.limit) });
            }
            usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }



        db.GetAggregation('tasker', usersQuery, function (err, docdata) {

            if (err) {
                res.send(err);
            } else {

                if (docdata.length != 0) {

                    res.send([docdata[0].documentData, docdata[0].count]);
                } else {
                    res.send([0, 0]);
                }
            }
        });
    };
    router.getrecenttasker = function getrecenttasker(req, res) {
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        var today = moment(Date.now()).format('YYYY-MM-DD');
        var today_start = today + ' 00:00:00';
        var today_end = today + ' 23:59:59';

        var query = {};
        if (req.body.status == 0) {
            query = { $and: [{ status: { $ne: 0 } }, { status: { $ne: 10 } }] };
        } else if (req.body.status == 5) {
            query = { status: { $in: [1, 2, 3] }, createdAt: { $gte: new Date(today_start), $lte: new Date(today_end) } };
        } else if (req.body.status == 13) {
            query = { document_status: { $eq: 2 } };
        }
        // else  if(req.body.status=='availability'){
        //      query = {$and: [ { status: { $ne: 0 } },{ status: { $ne: 10 } },{ availability :{$eq:1} } ] } ;
        // }
        else {
            query = { status: { $eq: req.body.status } };
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }

        var usersQuery = [{
            "$match": query
        }, {
            $project: {
                createdAt: 1,
                updatedAt: 1,
                /*updatedAt:
                {
                  $cond: { if: { $eq: [ "$updatedAt", "$createdAt" ] }, then: "Tasker Not Yet Logged In" , else:'$updatedAt'  }
                },*/
                username: 1,
                status: 1,
                email: 1,
                phone: 1,
                dname: { $toLower: '$' + sorted },
                activity: 1,
                availability: 1
            }
        }, {
            $project: {
                username: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];
        usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
        if (req.body.search) {
            var searchs = req.body.search;
            usersQuery.push({
                "$match": {
                    $or: [
                        { "documentData.username": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.email": { $regex: searchs + '.*', $options: 'si' } }

                    ]
                }
            });
            //search limit
            usersQuery.push({ $group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } } });
            usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
            if (req.body.limit && req.body.skip >= 0) {
                usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
            }
            usersQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
            //search limit
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            usersQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            usersQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        //usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        if (!req.body.search) {
            usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }

        db.GetAggregation('tasker', usersQuery, function (err, docdata) {

            var count = {};
            async.parallel([
                //All Tasker
                function (callback) {
                    db.GetCount('tasker', { $and: [{ status: { $ne: 0 } }, { status: { $ne: 10 } }] }, function (err, allValue) {
                        if (err) return callback(err);
                        count.allValue = allValue;
                        callback();
                    });
                },
                //verified Tasker
                function (callback) {
                    db.GetCount('tasker', { status: { $eq: 1 } }, function (err, verifiedValue) {
                        if (err) return callback(err);
                        count.verifiedValue = verifiedValue;
                        callback();
                    });
                },
                //Un verified Tasker
                function (callback) {
                    db.GetCount('tasker', { status: { $eq: 2 } }, function (err, unverifiedValue) {
                        if (err) return callback(err);
                        count.unverifiedValue = unverifiedValue;
                        callback();
                    });
                },
                //Document Pending Taskers
                function (callback) {
                    db.GetCount('tasker', { document_status: { $eq: 2 } }, function (err, docpendingValue) {
                        if (err) return callback(err);
                        count.docPendingValue = docpendingValue;
                        callback();
                    });
                },
                //Today's Taskers
                function (callback) {
                    db.GetCount('tasker', { status: { $in: [1, 2, 3] }, createdAt: { $gte: new Date(today_start), $lte: new Date(today_end) } }, function (err, todayValue) {
                        if (err) return callback(err);
                        count.todayValue = todayValue;
                        callback();
                    });
                }
            ], function (err) {

                if (err) return next(err);
                var totalCount = count;


                if (err || docdata.length <= 0) {
                    res.send([0, 0]);
                } else {
                    res.send([docdata[0].documentData, docdata[0].count, totalCount]);
                }
            });

        });
    };

    router.getAllearnings = function (req, res) {
        db.GetDocument('task', { 'status': 7, 'invoice.status': 1 }, {}, {}, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                var date = new Date();
                var isodate = date.toISOString();
                db.GetCount('coupon', { 'status': 1, "expiry_date": { "$gte": isodate }, "valid_from": { "$lte": isodate } }, function (err, couponcount) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        db.GetCount('newsletter', { 'status': 1 }, function (err, newsletter) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                var earn = {};
                                if (data) {
                                    var totalearning = 0;
                                    var admincomission = 0;
                                    for (var key = 0; key < data.length; key++) {
                                        if (data[key].invoice.amount.total) {
                                            totalearning += data[key].invoice.amount.total;
                                        }
                                        if (data[key].invoice.amount.admin_commission) {
                                            admincomission += data[key].invoice.amount.admin_commission;
                                        }
                                    }
                                    res.send([totalearning, admincomission, couponcount, newsletter]);
                                }
                            }
                        });
                    }
                });
            }
        });
    }






    router.delete = function (req, res) {
        req.checkBody('delData', 'Invalid delData').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        var query = { $and: [{ 'tasker': req.body.delData }, { $or: [{ 'status': { $in: [1, 2, 3, 4, 5, 6] } }, { 'payee_status': 0 }] }] }

        db.GetDocument('task', query, {}, {}, function (err, taskdata) {
            if (err) {
                res.send(err);
            } else {
                if (taskdata.length > 0) {
                    res.send({ 'status': 0, 'message': 'Unable To Delete The Expert Due To Pending Jobs/Payments.' });
                } else {
                    db.UpdateDocument('tasker', { _id: { $in: req.body.delData } }, { status: 0, 'device_info.device_token': '' }, { multi: true }, function (err, docdata) {
                        if (err) {
                            res.send(err);
                        } else {
                            var key = { 'key': 4, 'provider_id': req.body.delData };
                            var message = 'Your Account Has Been Deleted. Kindly Contact Admin. Your Profile Is Logged Out.';

                            push.sendPushnotification(req.body.delData, message, 'account_status', 'ANDROID', key, 'PROVIDER', function (err, response, body) { });
                            res.send(docdata);
                        }
                    });
                }
            }

        });
    };
    router.getQuestion = function getQuestion(req, res) {
        db.GetDocument('question', { status: 1 }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    router.remove = function (req, res) {
        req.checkBody('delData', 'Invalid delData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        async.parallel([
            //Delete Tasker
            function (callback) {
                db.RemoveDocument('tasker', { _id: { $in: req.body.delData } }, function (err, deldata) {
                    callback(err, deldata);
                });
            },
            //Delete Task
            function (callback) {
                db.RemoveDocument('task', { tasker: { $in: req.body.delData } }, function (err, deldata) {
                    callback(err, deldata);
                });
            },
            //Delete Reviews
            function (callback) {
                db.RemoveDocument('review', { tasker: { $in: req.body.delData } }, function (err, deldata) {
                    callback(err, deldata);
                });
            },
            //Delete Transactions
            function (callback) {
                db.RemoveDocument('transaction', { tasker: { $in: req.body.delData } }, function (err, deldata) {
                    callback(err, deldata);
                });
            },
            //Delete Notifications
            function (callback) {
                db.RemoveDocument('notifications', { tasker: { $in: req.body.delData } }, function (err, deldata) {
                    callback(err, deldata);
                });
            },
            //Delete Messages
            function (callback) {
                db.RemoveDocument('messages', { tasker: { $in: req.body.delData } }, function (err, deldata) {
                    callback(err, deldata);
                });
            }
        ], function (err, results) {

            if (err) {
                return next(err);
            } else {
                res.send(results);
            }
        });
    };

    router.approvtaskercategory = function (req, res) {
        db.UpdateDocument('tasker', { _id: req.body.data.tasker, 'taskerskills.childid': req.body.data.category }, { $set: { "taskerskills.$.status": req.body.status } }, {}, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                var getQuery = [
                    { "$match": { '_id': new mongoose.Types.ObjectId(req.body.data.tasker) } },
                    {
                        $project: {
                            taskerskills: {
                                $filter: {
                                    input: '$taskerskills',
                                    as: 'taskerskill',
                                    cond: { $eq: ['$$taskerskill.childid', new mongoose.Types.ObjectId(req.body.data.category)] }
                                }
                            },
                            username: 1,
                            email: 1
                        }
                    },
                    { $unwind: '$taskerskills' },
                    { '$lookup': { from: 'categories', localField: 'taskerskills.childid', foreignField: '_id', as: 'category' } },
                    { $unwind: '$category' }
                ];
                db.GetAggregation('tasker', getQuery, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        if (docdata[0].taskerskills.status == 2) {
                            var categorystatus = "unverified";
                        }
                        else {
                            var categorystatus = "verified";
                        }

                        /* var mailData = {};
                        mailData.template = 'approvtaskercategory';
                        mailData.to = docdata[0].email;
                        mailData.html = [];
                        mailData.html.push({ name: 'username', value: docdata[0].username });
                        mailData.html.push({ name: 'categoryname', value: docdata[0].category.name });
                        mailData.html.push({ name: 'categorystatus', value: categorystatus });

                        mailcontent.sendmail(mailData, function (err, response) { });
*/
                        res.send({ "status": req.body.status, "result": result });

                    }
                });
            }
        });
    };

    router.saveNewVehicle = function saveNewVehicle(req, res) {
        var data = req.body.vehicle;
        db.UpdateDocument('tasker', { _id: req.body._id }, { vehicle: req.body.vehicle }, {}, function (err, docdata) {

            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }
    router.getCategories = function (req, res) {
        var getQuery = [{
            "$match": { $and: [{ status: { $ne: 0 } }, { status: { $ne: 2 } }] }

        }, { '$lookup': { from: 'categories', localField: 'parent', foreignField: '_id', as: 'parent' } },
        { $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } }, {
            $project: {
                image: 1,
                name: 1,
                parent: 1,
                seo: 1,
                skills: 1,
                slug: 1,
                status: 1
            }
        }, {
            $project: {
                name: 1,
                document: "$$ROOT"
            }
        },
        {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];
        db.GetAggregation('category', getQuery, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                if (docdata.length != 0) {

                    res.send(docdata[0].documentData);
                } else {
                    res.send([0, 0]);
                }
            }
        });
    }
    router.getusercategories = function getusercategories(req, res) {
        var options = {};
        options.populate = 'taskerskills.categoryid';
        db.GetOneDocument('tasker', { _id: req.body._id }, { taskerskills: 1 }, options, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata.taskerskills);
            }
        });
    }
    router.getExperience = function getExperience(req, res) {
        db.GetDocument('experience', { status: 1 }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }
    router.gettaskercategory = function gettaskercategory(req, res) {
        var options = {};
        options.populate = 'taskerskills.childid';
        db.GetOneDocument('tasker', { _id: req.body._id }, { taskerskills: 1 }, options, function (err, docdata) {
            if (err || !docdata) {
                res.send(err);
            } else {
                if (docdata.taskerskills) {
                    res.send(docdata.taskerskills);
                } else {
                    res.send(docdata);
                }
            }
        });
    }
    router.deleteCategory = function (req, res) {
        db.UpdateDocument('tasker', { _id: req.body.userid }, { $pull: { "taskerskills": { childid: req.body.categoryid.toString() } } }, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    }
    router.addcategory = function addcategory(req, res) {
        var data = {};
        data.taskerskills = {};
        var userid = req.body.userid;
        var skills = [];
        if (req.file) {
            data.taskerskills.file = req.file.destination + req.file.filename;
        }
        data.taskerskills.experience = req.body.experience;
        data.taskerskills.hour_rate = req.body.hour_rate;
        data.taskerskills.quick_pitch = req.body.quick_pitch;
        data.taskerskills.categoryid = req.body.categoryid;
        data.taskerskills.childid = req.body.childid;
        data.taskerskills.skills = req.body.skills;
        data.taskerskills.terms = req.body.terms;
        data.taskerskills.status = req.body.status;
        var options = {};
        options.populate = 'taskerskills.childid';
        db.GetOneDocument('tasker', { _id: userid, 'taskerskills.childid': data.taskerskills.childid }, { taskerskills: 1 }, {}, function (err, docdata) {
            if (docdata) {
                db.UpdateDocument('tasker', { _id: userid, 'taskerskills.childid': data.taskerskills.childid }, { $set: { "taskerskills.$": data.taskerskills } }, function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                });
            } else {
                db.UpdateDocument('tasker', { _id: userid }, { $push: { "taskerskills": data.taskerskills } }, function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                });
            }
        });
    }
    router.addNewCategory = function addNewCategory(req, res) {
        var data = {};
        data.taskerskills = {};
        var userid = req.body.userid;
        var skills = [];
        data.taskerskills.experience = req.body.experience;
        data.taskerskills.hour_rate = req.body.hour_rate;
        data.taskerskills.quick_pitch = req.body.quick_pitch;
        data.taskerskills.categoryid = req.body.categoryid;
        data.taskerskills.childid = req.body.childid;
        data.taskerskills.skills = req.body.skills;
        data.taskerskills.terms = req.body.terms;
        var options = {};
        options.populate = 'taskerskills.categoryid';
        db.GetOneDocument('tasker', { _id: userid, 'taskerskills.categoryid': data.taskerskills.categoryid }, { taskerskills: 1 }, options, function (err, docdata) {
            if (err || !docdata) {
                db.UpdateDocument('tasker', { _id: userid }, { $push: { "taskerskills": data.taskerskills } }, function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                });
            } else {
                db.UpdateDocument('tasker', { _id: userid, 'taskerskills.categoryid': data.taskerskills.categoryid }, { $set: { "taskerskills.$": data.taskerskills } }, function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                });
            }
        });
    }
    router.category = function category(req, res) {
        var options = {};
        options.populate = 'taskerskills.categoryid';
        db.GetOneDocument('tasker', { _id: req.body._id }, {}, options, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata.taskerskills);
            }
        });
    }
    router.saveAvailability = function saveAvailability(req, res) {


        var user = {};
        user.working_area = req.body.working_area;
        user.location = req.body.location;
        user.working_days = req.body.working_days;
        user.radius = req.body.radius;
        user.radiusby = req.body.radiusby;
        user.availability_address = req.body.availability_address;
        user.working_days = user.working_days.filter(function (n) { return n != undefined });


        db.UpdateDocument('tasker', { _id: req.body._id }, user, function (err, docdata) {

            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }
    router.mapsave = function mapsave(req, res) {
        var user = {};
        user.working_area = req.body.working_area;
        user.working_days = req.body.working_days;
        user.working_days = user.working_days.filter(function (n) { return n != undefined });
        db.UpdateDocument('tasker', { _id: req.body._id }, user, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }
    router.gettaskerdetails = function (req, res) {
        db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
            var getQuery = [{
                "$match": { role: 'tasker', status: { $nin: [1, 0] } }
            },
            {
                $project: {
                    email: 1,
                    username: 1,
                    status: 1,
                    "avatar": {
                        $ifNull: ["$avatar", settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT]
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    document: "$$ROOT"
                }
            }, {
                $limit: 10
            },
            {
                $group: { "_id": "_id", "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
            }
            ];
            db.GetAggregation('tasker', getQuery, function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                    if (data.length != 0) {
                        for (var i = 0; i < data[0].count; i++) {
                            if (data[0].documentData[i].avatar == '') {
                                data[0].documentData[i].avatar = settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                            }
                        }
                        res.send(data[0].documentData);
                    } else {
                        res.send([0]);
                    }
                }
            });
        });
    };

    router.verifiedtaskerdetails = function (req, res) {
        db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
            var getQuery = [{
                "$match": { role: 'tasker', status: { $nin: [2, 3, 0] } }
            },
            {
                $project: {
                    email: 1,
                    username: 1,
                    status: 1,
                    "avatar": {
                        $ifNull: ["$avatar", settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT]
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    document: "$$ROOT"
                }
            }, {
                $limit: 10
            },
            {
                $group: { "_id": "_id", "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
            }
            ];
            db.GetAggregation('tasker', getQuery, function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                    if (data.length != 0) {
                        for (var i = 0; i < data[0].count; i++) {
                            if (data[0].documentData[i].avatar == '') {
                                data[0].documentData[i].avatar = settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                            }
                        }
                        res.send(data[0].documentData);
                    } else {
                        res.send([0]);
                    }
                }
            });
        });
    };

    router.getuserdetails = function (req, res) {
        db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
            var getQuery = [{
                "$match": { role: 'user', status: { $ne: 0 } }
            },
            {
                $project: {
                    email: 1,
                    username: 1,
                    status: 1,
                    createdAt: 1,

                    "avatar": {
                        $ifNull: ["$avatar", settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT]
                    }
                }
            }, {
                $project: {
                    document: "$$ROOT"
                }
            },
            {
                $sort: {
                    "document.createdAt": -1
                }
            },
            {
                $limit: 10
            },
            {
                $group: { "_id": "_id", "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
            }

            ];
            db.GetAggregation('users', getQuery, function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                    if (data.length != 0) {
                        res.send(data[0].documentData);
                    } else {
                        res.send([0]);
                    }
                }
            });
        });
    };
    router.gettaskdetails = function (req, res) {
        var extension = {};
        extension.options = { limit: 10 };
        extension.populate = 'user tasker';
        db.GetDocument('task', { status: { $nin: [10, 0] } }, {}, extension, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);

            }
        });
    };
    router.deletuserdata = function (req, res) {
        db.UpdateDocument('users', { '_id': req.body.data }, { 'status': 0 }, {}, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    };
    router.approvetasker = function (req, res) {

        db.UpdateDocument('tasker', { '_id': req.body.data }, { 'status': req.body.status }, {}, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                db.GetDocument('tasker', { '_id': req.body.data }, {}, {}, function (err, taskerdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        db.GetDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                            if (err) {
                                res.send(err);
                            } else {
                                var name;
                                if (taskerdata[0].name) {
                                    name = taskerdata[0].name.first_name + " (" + taskerdata[0].username + ")";
                                } else {
                                    name = taskerdata[0].username;
                                }
                                var mailData = {};
                                mailData.template = 'Profileapprovel';
                                mailData.to = taskerdata[0].email;
                                mailData.language = taskerdata[0].language;
                                mailData.html = [];
                                mailData.html.push({ name: 'firstname', value: name });
                                mailData.html.push({ name: 'site_url', value: settings[0].settings.site_url });
                                mailData.html.push({ name: 'site_title', value: settings[0].settings.site_title });
                                mailData.html.push({ name: 'logo', value: settings[0].settings.logo });
                                mailcontent.sendmail(mailData, function (err, response) { });
                                res.send({ "status": req.body.status, "data": data });
                            }
                        });
                    }
                });
                //    res.send({ "status": req.body.status, "data": data });

            }
        });
    };


    router.updateAvailability = function updateAvailability(req, res) {

        var data = {};
        data.tasker = req.body._id;
        data.availability = req.body.availability;

        taskerLibrary.updateAvailability(data, function (err, response) {
            if (err) {
                res.send(err);
            } else {
                res.send(response);
            }
        });
        /*
        var user = {};
        user.availability = req.body.availability;
        db.UpdateDocument('tasker', { _id: req.body._id }, user, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
        */
    }
    router.getChild = function getChild(req, res) {
        db.GetOneDocument('category', { _id: req.body.id }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });

    }

    router.saveaccountinfo = function (req, res) {
        var request = {};
        request.userid = req.body.userId;
        request.banking = {};
        request.banking.acc_holder_name = req.body.acc_holder_name;
        // request.banking.acc_holder_address = req.body.acc_holder_address;
        request.banking.acc_number = req.body.acc_number;
        request.banking.bank_name = req.body.bank_name;
        // request.banking.branch_name = req.body.branch_name;
        // request.banking.branch_address = req.body.branch_address;
        //request.banking.account_type = req.body.account_type;
        request.banking.routing_number = req.body.routing_number;

        db.UpdateDocument('tasker', { '_id': request.userid }, { 'banking': request.banking }, {}, function (err, response) {
            if (err || response.nModified == 0) {
                res.send(err);
            } else {
                res.send(response);
            }
        });
    }
    router.getDeletedTaskers = function getDeletedTaskers(req, res) {
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }

        var usersQuery = [{
            "$match": { status: { $eq: 0 }, "role": "tasker" }
        },
        {
            $project: {
                createdAt: 1,
                updatedAt: 1,
                username: 1,
                status: 1,
                email: 1,
                dname: { $toLower: '$' + sorted },
                activity: 1,
                availability: 1
            }
        }, {
            $project: {
                username: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];


        usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            var searchs = req.body.search;
            usersQuery.push({
                "$match": {
                    $or: [
                        { "documentData.username": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.email": { $regex: searchs + '.*', $options: 'si' } }

                    ]
                }
            });
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            usersQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            usersQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });

        db.GetAggregation('tasker', usersQuery, function (err, docdata) {
            var count = {};
            async.parallel([
                //All DeleTasker
                function (callback) {
                    db.GetCount('tasker', { status: { $eq: 0 } }, function (err, allValue) {
                        if (err) return callback(err);
                        count.allValue = allValue;
                        callback();
                    });
                }
            ], function (err) {
                if (err) return next(err);
                var totalCount = count;
                if (err || docdata.length <= 0) {
                    res.send([0, 0]);
                } else {
                    res.send([docdata[0].documentData, docdata[0].count, totalCount]);
                }
            });

        });
    };

    return router;
};
