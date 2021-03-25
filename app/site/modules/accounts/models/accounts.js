var app = angular.module('handyforall.accounts');
app.factory('accountService', accountService);
function accountService($http, $q, Upload) {
    var accountService = {
        saveAccount: saveAccount,
        savePassword: savePassword,
        saveProfile: saveProfile,
        getCategories: getCategories,
        edit: edit,
        updatetaskstatus: updatetaskstatus,
        updatetaskstatuscash: updatetaskstatuscash,
        updatewalletdata: updatewalletdata,
        getmaincatname: getmaincatname,
        getwalletdetails: getwalletdetails,
        getsettings: getsettings,
        getQuestion: getQuestion,
        getChild: getChild,
        getCategoriesofuser: getCategoriesofuser,
        taskListService: taskListService,
        getTaskDetailsByStaus: getTaskDetailsByStaus,
        getSearchTaskDetailsByStaus: getSearchTaskDetailsByStaus,
        getTaskDetailsBytaskid: getTaskDetailsBytaskid,
        updateTask: updateTask,
        inserttaskerreview: inserttaskerreview,
        updateTaskcompletion: updateTaskcompletion,
        usercanceltask: usercanceltask,
        ignoreTask: ignoreTask,
        taskerconfirmTask: taskerconfirmTask,
        saveAvailability: saveAvailability,
        getExperience: getExperience,
        updateCategory: updateCategory,
        deleteCategory: deleteCategory,
        deactivateAccount: deactivateAccount,
        getReview: getReview,
        getuserReview: getuserReview,
        setReview: setReview,
        getTransactionHis: getTransactionHis,
        //saveTaskerAccount: saveTaskerAccount,
        saveTaskerPassword: saveTaskerPassword,
        deactivateTaskerAccount: deactivateTaskerAccount,
        taskinfo: taskinfo,
        confirmtask: confirmtask,
        addUserReview: addUserReview,
        gettaskinfobyid: gettaskinfobyid,
        disputeUpdateTask: disputeUpdateTask,
        getTaskDetails: getTaskDetails,
        gettaskreview: gettaskreview,
        updateAvailability: updateAvailability,
        downloadPdf: downloadPdf,
        getcancelreason: getcancelreason,
        saveaccountinfo: saveaccountinfo,
        getUserTransaction: getUserTransaction,
        getUserTaskDetailsByStaus: getUserTaskDetailsByStaus,
        getseosetting: getseosetting,
        updatewalletdatapaypal: updatewalletdatapaypal,
        getUserWalletTransaction: getUserWalletTransaction,
        checkphoneno: checkphoneno,
        getPaymentdetails: getPaymentdetails,
        updateTaskerDocument: updateTaskerDocument

    };
    return accountService;

    function setReview(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/addReview',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function saveAccount(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/settings/save',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function disputeUpdateTask(data, status) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/disputeupdateTask',
            data: { 'data': data, 'status': status }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getUserWalletTransaction(id, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getuserwallettransaction',
            data: {
                id: id, skip: skip, limit: itemsPerPage
            }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function ignoreTask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/ignoreTask',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function taskerconfirmTask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/taskerconfirmtask',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function saveProfile(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updateprofiledetails',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function savePassword(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/password/save',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function saveAvailability(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/availability/save',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updateAvailability(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/availability/update',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function edit(id) {
        var data = { id: id };
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/edit',
            data: data
        }).then(function (data) {
            deferred.resolve(data[0].data);
        },function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getCategories() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/categories/get'
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getChild(id) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/categories/getchild',
            data: { id: id }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getTransactionHis(id, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/transcationhis',
            data: {
                id: id, skip: skip, limit: itemsPerPage
            }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getUserTransaction(id, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/usertranscation',
            data: {
                id: id, skip: skip, limit: itemsPerPage
            }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updatewalletdata(data, user) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatewalletdata',
            data: { data: data, user: user }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getmaincatname(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getmaincatname',
            data: { data: data }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function updatetaskstatus(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatetaskstatus',
            data: { data: data }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updatetaskstatuscash(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatetaskstatuscash',
            data: { data: data }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updatewalletdatapaypal(data, user) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatewalletdatapaypal',
            data: { data: data, user: user }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getwalletdetails(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getwalletdetails',
            data: { data: data }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function getsettings() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getsettings',
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    // By venki
    function getQuestion() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/account/question/getQuestion'
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getExperience() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/categories/get-experience'
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getCategoriesofuser(id) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getcategoriesofuser',
            data: { _id: id }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getTaskDetailsByStaus(Id, status, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getTaskDetailsByStaus',
            data: { _id: Id, status: status, skip: skip, limit: itemsPerPage }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getSearchTaskDetailsByStaus(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getSearchTaskDetailsByStaus',
            data: data,
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getUserTaskDetailsByStaus(Id, status, page, itemsPerPage) {

        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getUserTaskDetailsByStaus',
            data: { _id: Id, status: status, skip: skip, limit: itemsPerPage }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getTaskDetailsBytaskid(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getTaskDetailsBytaskid',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function taskListService(Id, status, page, itemsPerPage) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getTaskList',
            data: { _id: Id, status: status, skip: skip, limit: itemsPerPage }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function updateTask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updateTask',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function inserttaskerreview(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/insertaskerReview',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function updateTaskcompletion(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updateTaskcompletion',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function usercanceltask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/usercanceltask',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updateCategory(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/updatecategoryinfo',
            data: data,
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deactivateAccount(userid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/deactivateAccount',
            data: { userid: userid }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deleteCategory(categoryinfo) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/deleteCategory',
            data: categoryinfo
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getReview(id, page, itemsPerPage, role) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getreview',
            data: { id: id, skip: skip, limit: itemsPerPage, role: role }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getuserReview(id, page, itemsPerPage, role) {
        var skip = 0;
        if (page > 1) {
            skip = (parseInt(page) - 1) * itemsPerPage;
        }
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getuserReview',
            data: { id: id, skip: skip, limit: itemsPerPage, role: role }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    //tasker -------------
    /*
    function saveTaskerAccount(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/tasker/settings/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    */

    function saveTaskerPassword(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/tasker/password/save',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deactivateTaskerAccount(userid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/deactivateTaskertAccount',
            data: { userid: userid }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function taskinfo(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/taskinfo',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function confirmtask(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/taskinfo',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function addUserReview(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/addReview',
            data: { data: data }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function gettaskinfobyid(taskid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/gettaskbyid',
            data: { task: taskid }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getTaskDetails(userid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getTaskDetails',
            data: { _id: userid }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function gettaskreview(taskid) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/gettaskreview',
            data: { taskid: taskid }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function downloadPdf(_id) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/downloadPdf',
            data: { _id: _id }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getcancelreason(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getcancelreason',
            data: { type: data }
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function saveaccountinfo(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/saveaccountinfo',
            data: data
        }).then(function (data) {
            console.log("success data");
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getseosetting() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/site/landing/getseosetting'
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function checkphoneno(data) {
        console.log("data", data)
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/checkphoneno',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function getPaymentdetails(data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/site/account/getPaymentdetails',
            data: data
        }).then(function (data) {
            deferred.resolve(data.data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function updateTaskerDocument(value) {
        var deferred = $q.defer();
        Upload.upload({
            method: 'post',
            url: '/site/account/updateTaskerDocument',
            data: value
        }).then(function (data) {
            deferred.resolve(data);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
}
