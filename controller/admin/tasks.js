"use strict";
module.exports = function (app, io) {

    var taskLibrary = require('../../model/task.js')(io);
    var path = require('path');
    var fs = require('fs');
    var mongoose = require('mongoose');
    var db = require('../../model/mongodb.js');
    var CONFIG = require('../../config/config');
    var async = require("async");
    var push = require('../../model/pushNotification.js')(io);
    var moment = require("moment");
    var controller = {};

    controller.recenttask = function (req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        if (req.query.sort != "") {
            var sorted = req.query.sort;
        }
        var bannerQuery = [{
            "$match": { status: { $nin: [10, 0] } }
        }, {
            $lookup:
            {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        }, {
            $lookup:
            {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $project: {
                tasker: 1,
                booking_id: 1,
                createdAt: 1,
                task_date: 1,
                category: 1,
                user: 1,
                billing_address: 1,
                status: 1
            }
        }, {
            $project: {
                question: 1,

                document: "$$ROOT"
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];

        var sorting = {};
        var searchs = '';


        if (Object.keys(req.query).length != 0) {
            bannerQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

            if (req.query.search != '' && req.query.search != 'undefined' && req.query.search) {
                searchs = req.query.search;
                bannerQuery.push({ "$match": { "documentData.category.name": { $regex: searchs + '.*', $options: 'si' } } });
            }
            if (req.query.sort !== '' && req.query.sort) {
                sorting = {};
                if (req.query.status == 'false') {
                    sorting["documentData.dname"] = -1;
                    bannerQuery.push({ $sort: sorting });
                } else {
                    sorting["documentData.dname"] = 1;
                    bannerQuery.push({ $sort: sorting });
                }
            }
            if (req.query.limit != 'undefined' && req.query.skip != 'undefined') {
                bannerQuery.push({ '$skip': parseInt(req.query.skip) }, { '$limit': parseInt(10) });
            }
            bannerQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }

        db.GetAggregation('task', bannerQuery, function (err, docdata) {
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
    }

    controller.list = function (req, res) {
        taskLibrary.taskExpired({}, function (err, response) {

            var errors = req.validationErrors();
            if (errors) {
                res.send(errors, 400);
                return;
            }
            var query = {};
            
            /*if (req.body.date && req.body.date.from && req.body.date.to) {
                var fromDate = timezone.tz(req.body.date.from, results.settings.time_zone); 
                var toDate = timezone.tz(req.body.date.to, results.settings.time_zone);
            }*/

            let status ;
            
            if (req.body.status == 0) {
                status = { $and: [{ status: { $ne: 0 } }, { status: { $ne: 10 } }] };
            } else if (req.body.status == 1) {
                status = { $or: [{ status: { $eq: 1 } }, { status: { $eq: 2 } }, { status: { $eq: 3 } }, { status: { $eq: 4 } }, { status: { $eq: 5 } }] };
            } else if (req.body.status == 7) {
                status = { $or: [{ status: { $eq: 6 } }, { status: { $eq: 7 } }] };
            } else {
                status = { status: { $eq: req.body.status } };
            }
            // query = status;       
            query.booking_information = {}

            if (req.body.date && (req.body.date.from || req.body.date.to)) {
                //var fromDate = moment(new Date(req.body.date.from)).format('YYYY-MM-DD') + ' 00:00:00';
                var toDate = moment(new Date(req.body.date.to)).format('YYYY-MM-DD') + ' 23:59:59';
                var fromDate = new Date(req.body.date.from)
                toDate = new Date(toDate)
            }

            //console.log("fromDate",fromDate.setDate(fromDate.getDate()))
            //console.log("toDate",toDate.setDate(toDate.getDate()))

            if (req.body.date && req.body.date.from && req.body.date.to) { // from_date and to_date
                query ={"booking_information.booking_date": { '$gte': fromDate, '$lte': toDate }} 
            } else if (req.body.date && req.body.date.from && !req.body.date.to) { // from_date
                query = {"booking_information.booking_date": { '$gte': fromDate }} 
            } else if (req.body.date && !req.body.date.from && req.body.date.to) { // to_date
                query ={"booking_information.booking_date": { '$lte': toDate }}
            }
            if ((req.body.date && req.body.date.from) || (req.body.date && req.body.date.to)) {
                query ={...query,...status}
            } else{
                query = status;
            }

            console.log("query...........",JSON.stringify(query))

            if (req.body.sort) {
                var sorted = req.body.sort.field;
            }

            var usersQuery = [{
                "$match": query
            },
            { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "tasker", localField: "tasker", foreignField: "_id", as: "tasker" } },
            { $unwind: { path: "$tasker", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    tasker: "$tasker.username",
                    category: "$category.name",
                    user: "$user.username",
                    booking_id: 1,
                    billing_address: 1,
                    status: 1,
                    updatedAt: 1
                }
            }, {
                $project: {
                    question: 1,
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
                            { "documentData.category": { $regex: searchs + '.*', $options: 'si' } },
                            { "documentData.booking_id": { $regex: searchs + '.*', $options: 'si' } },
                            { "documentData.user": { $regex: searchs + '.*', $options: 'si' } },
                            { "documentData.tasker": { $regex: searchs + '.*', $options: 'si' } }
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
                sorting["documentData.updatedAt"] = -1;
                usersQuery.push({ $sort: sorting });
            }

            if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
                usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
            }

            //usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
            if (!req.body.search) {
                usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
            }

            db.GetAggregation('task', usersQuery, function (err, docdata) {
                if (err) {
                    res.send(err);
                } else {
                    var count = {};
                    async.parallel([
                        //All Task
                        function (callback) {
                            db.GetCount('task', { $and: [{ status: { $ne: 0 } }, { status: { $ne: 10 } }] }, function (err, allValue) {
                                if (err) return callback(err);
                                count.allValue = allValue;
                                callback();
                            });
                        },
                        //OnGoing Task
                        function (callback) {
                            db.GetCount('task', { $or: [{ status: { $eq: 1 } }, { status: { $eq: 2 } }, { status: { $eq: 3 } }, { status: { $eq: 4 } }, { status: { $eq: 5 } }] }, function (err, onGoingValue) {
                                if (err) return callback(err);
                                count.onGoingValue = onGoingValue;
                                callback();
                            });
                        },
                        //complted Task
                        function (callback) {
                            db.GetCount('task', { $or: [{ status: { $eq: 7 } }, { status: { $eq: 6 } }] }, function (err, completedValue) {
                                if (err) return callback(err);
                                count.completedValue = completedValue;
                                callback();
                            });
                        },
                        //cancel Task
                        function (callback) {
                            db.GetCount('task', { status: { $eq: 8 } }, function (err, cancelValue) {
                                if (err) return callback(err);
                                count.cancelValue = cancelValue;
                                callback();
                            });
                        }
                    ], function (err) {

                        if (err) return next(err);
                        var totalCount = count;
                        //res.render('user-profile', count);

                        if (docdata.length != 0) {
                            res.send([docdata[0].documentData, docdata[0].count, totalCount]);
                        } else {
                            res.send([0, 0]);
                        }
                    });
                }
            });
        });
    }

    controller.edit = function (req, res) {
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        var editTasksQuery = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.body.id),
                    // status: { $ne: 0 }
                }
            },
            {
                $lookup:
                {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $lookup:
                {
                    from: "categories",
                    localField: "category.parent",
                    foreignField: "_id",
                    as: "maincategory"
                }
            },
            {
                $lookup:
                {
                    from: "tasker",
                    localField: "tasker",
                    foreignField: "_id",
                    as: "tasker"
                }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $lookup:
                {
                    from: "messages",
                    localField: "_id",
                    foreignField: "task",
                    as: "messages"
                }
            },
            {
                $project: {
                    booking_id: 1,
                    service_address: 1,
                    tasker: 1,
                    category: 1,
                    maincategory: 1,
                    user: 1,
                    messages: 1,
                    billing_address: 1,
                    status: 1,
                    invoice: 1,
                    task_date: 1,
                    task_description: 1,
                    task_session : 1,
                    task_hour: 1,
                    admin_commission_percentage: 1,
                    payment_mode: 1,
                    tasker_amount: 1,
                    usertaskcancellationreason: 1,
                    task_address: 1,
                    cancellation: 1
                }
            }, {
                $project: {
                    question: 1,
                    document: "$$ROOT"
                }
            }, {
                $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
            }];


        db.GetAggregation('task', editTasksQuery, function (err, docdata) {
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

    controller.save = function (req, res) {
        var errors = req.validationErrors();

        if (errors) {
            res.send(errors, 400);
            return;
        }

        var data = {};

        data.question = req.body.question;
        data.status = req.body.status;
        if (req.body._id) {
            db.UpdateDocument('task', { _id: { $in: req.body._id } }, data, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(result);
                }
            });
        } else {
            db.InsertDocument('task', data, function (err, result) {

                if (err) {
                    res.send(err);
                } else {
                    res.send(result);
                }
            });
        }
    }

    controller.deletequestion = function (req, res) {
        req.checkBody('delData', 'Invalid delData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        db.UpdateDocument('tasker', { 'current_task': { $in: req.body.delData } }, { $unset: { "current_task": "" } }, { multi: true }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                db.UpdateDocument('task', { _id: { $in: req.body.delData } }, { status: 8 }, { multi: true }, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        db.UpdateDocument('transaction', { task: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
                            if (err) {
                                res.send(err);
                            } else {
                                db.UpdateDocument('messages', { task: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        db.UpdateDocument('review', { task: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
                                            if (err) {
                                                res.send(err);
                                            } else {
                                                var options = {};
                                                options.populate = 'user tasker';
                                                db.GetDocument('task', { _id: req.body.delData }, {}, options, function (err, taskDetails) {
                                                    if (err) {
                                                        res.send(err);
                                                    } else {

                                                        if (taskDetails[0].tasker.total_review == 0) {
                                                            var total_review = taskDetails[0].tasker.total_review;
                                                        } else {
                                                            var total_review = taskDetails[0].tasker.total_review - 1;
                                                        }
                                                        var avg_review = taskDetails[0].tasker.avg_review;

                                                        db.UpdateDocument('tasker', { _id: taskDetails[0].tasker._id }, { 'total_review': total_review, 'avg_review': avg_review }, {}, function (err, response) {
                                                            if (err) {
                                                                res.send(err);
                                                            } else {
                                                                var notifications = { 'job_id': taskDetails[0].booking_id, 'user_id': taskDetails[0].tasker._id };
                                                                var message = 'Admin Cancelled The Task';
                                                                push.sendPushnotification(taskDetails[0].tasker._id, message, 'Admin Cancelled The Task', 'ANDROID', notifications, 'PROVIDER', function (err, response, body) { });
                                                                push.sendPushnotification(taskDetails[0].user._id, message, 'Admin Cancelled The Task', 'ANDROID', notifications, 'USER', function (err, response, body) { });
                                                                res.send(response);
                                                            }
                                                        })
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }


    controller.firsttask = function (req, res) {
        db.GetOneDocument('billing', {}, {}, {}, function (err, billingcycyle) {
            if (err) {
                res.send(err);
            } else {
                if (!billingcycyle) {
                    var sorting = {};
                    sorting['createdAt'] = 1;
                    var ext = {};
                    ext.sort = sorting
                    db.GetOneDocument('task', { 'status': 7 }, {}, ext, function (err, docdata) {
                        if (err || !docdata) {
                            res.send({ status: 0 });
                        } else {
                            res.send(docdata);
                        }
                    });
                } else {
                    var sorting = {};
                    sorting['createdAt'] = -1;
                    var ext = {};
                    ext.sort = sorting
                    db.GetOneDocument('billing', { 'status': 1 }, {}, ext, function (err, lastdate) {
                        if (err || !lastdate) {
                            res.send({ status: 0 });
                        } else {
                            res.send(lastdate);
                        }
                    });
                }
            }
        });
    }


    controller.getTransaction = function (req, res) {
        var options = {};
        options.populate = 'tasker user task ';

        db.GetDocument('transaction', { 'task': req.body.id }, {}, options, function (err, docdata) {
            if (err) {

                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.deletedList = function (req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        /*    var query = {};
            if (req.body.status == 0) {
                query = { $and: [{ status: { $ne: 0 } }, { status: { $ne: 10 } }] };
            } else if (req.body.status == 1) {
                query = { $or: [{ status: { $eq: 1 } }, { status: { $eq: 2 } }, { status: { $eq: 3 } }, { status: { $eq: 4 } }, { status: { $eq: 5 } }] };
            } else if (req.body.status == 7) {
                query = { $or: [{ status: { $eq: 6 } }, { status: { $eq: 7 } }] };
            } else {
                query = { status: { $eq: req.body.status } };
            }*/


        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }


        var usersQuery = [{
            "$match": { status: { $eq: 8 } }

        }, {
            $lookup:
            {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        }, {
            $lookup:
            {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        }, {
            $lookup:
            {
                from: "tasker",
                localField: "tasker",
                foreignField: "_id",
                as: "tasker"
            }
        },
        {
            $project: {
                tasker: 1,
                category: 1,
                user: 1,
                booking_id: 1,
                billing_address: 1,
                status: 1
            }
        }, {
            $project: {
                question: 1,
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
                        { "documentData.category.name": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.booking_id": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.user.username": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.tasker.username": { $regex: searchs + '.*', $options: 'si' } }
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

        db.GetAggregation('task', usersQuery, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {


                var count = {};
                async.parallel([
                    //All Deleted Task
                    function (callback) {
                        db.GetCount('task', { status: { $eq: 0 } }, function (err, allValue) {
                            if (err) return callback(err);
                            count.allValue = allValue;
                            callback();
                        });
                    }
                ], function (err) {

                    if (err) return next(err);
                    var totalCount = count;
                    if (docdata.length != 0) {
                        res.send([docdata[0].documentData, docdata[0].count, totalCount]);
                    } else {
                        res.send([0, 0]);
                    }

                });
            }
        });
    }


    return controller;
}
