"use strict";

var db = require('../../model/mongodb.js');
//var library = require('../../model/library.js');
//var attachment = require('../../model/attachments.js');
//var CONFIG = require('../../config/config.js');
//var async = require("async");

module.exports = function () {
    var router = {};

    router.save = function (req, res) {
        console.log("req.body", req.body);
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors);
            return;
        }

        var data = {};

        req.checkBody('name', 'Invalid name').notEmpty();
        //req.checkBody('description', 'Invalid description').notEmpty();
        req.checkBody('status', 'Invalid status').notEmpty();

        data.name = req.body.name;
        //data.description = req.body.description;
        data.status = req.body.status;
        var str = req.body.name;
        data.replace_name = str.replace(" ", "_");

        if (req.body._id) {
            db.GetDocument('tasker_documents', { 'name': data.name }, {}, {}, function (err, users) {
                if (err) {
                    res.send(err);
                } else {
                    db.UpdateDocument('tasker_documents', { _id: req.body._id }, data, {}, function (err, docdata) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send({ msg: 'success', data: docdata });
                        }
                    });
                }
            });
        } else {
            db.GetOneDocument('tasker_documents', { 'name': req.body.name }, {}, {}, function (err, docs) {
                if (err) {
                    res.send(err);
                } else {
                    if (docs) {
                        if (docs.name == req.body.name) {
                            res.status(400).send({ msg: 'Name Already Exists' });
                        }
                    } else {
                        data.status = req.body.status;
                        db.InsertDocument('tasker_documents', data, function (err, result) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send(result);
                            }
                        });
                    }
                }
            });
        }
    }

    router.allDocument = function allDocument(req, res) {
        var errors = req.validationErrors();
        var query = {};

        /*   if (req.body.status == 0) {*/
        query = { status: { $ne: 0 } };
        /* }
         else {
             query = { status: { $eq: req.body.status } };
         }*/
        if (errors) {
            res.send(errors, 400);
            return;
        }
        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }

        var usersQuery = [{
            "$match": query
        }, {
            $project: {
                //createdAt: 1,
                //updatedAt: 1,
                // updatedAt:
                // {
                //   $cond: { if: { $eq: [ "$updatedAt", "$createdAt" ] }, then: "User Not Yet Logged In" , else:'$updatedAt'  }
                // },
                name: 1,
                description: 1,
                status: 1,
                doc_status: 1
                //role: 1,
                //status: 1,
                //email: 1,
                //dname: { $toLower: '$' + sorted },
                //activity: 1
            }
        }, {
            $project: {
                name: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];

        usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        //console.log('req.body.search--------------', req.body.search)

        if (req.body.search) {
            var searchs = req.body.search;

            usersQuery.push({ "$match": { $or: [{ "documentData.name": { $regex: searchs + '.*', $options: 'si' } }, { "documentData.email": { $regex: searchs + '.*', $options: 'si' } }] } });
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
        if (!req.body.search) {
            usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }

        db.GetAggregation('tasker_documents', usersQuery, function (err, docdata) {

            if (err || docdata.length <= 0) {
                res.send([0, 0]);
            } else {

                res.send([docdata[0].documentData, docdata[0].count]);
            }
        });
    };

    router.edit = function (req, res) {
        db.GetOneDocument('tasker_documents', { _id: req.body.id }, {}, {}, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    };
    router.delete = (req, res) => {
        db.RemoveDocument('tasker_documents', { _id: { $in: req.body.delData } }, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    }

    return router;
}