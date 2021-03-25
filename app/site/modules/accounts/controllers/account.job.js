angular.module('handyforall.accounts')
    .controller('AccountTaskerJobCtrl', AccountTaskerJobCtrl)
    .controller('TaskInviteViewModalInstanceCtrl', TaskInviteViewModalInstanceCtrl)
    .controller('TaskDetailsCancelModalInstanceCtrl', TaskDetailsCancelModalInstanceCtrl)
    .controller('TaskerExtraViewModalInstanceCtrl', TaskerExtraViewModalInstanceCtrl)
    .controller('TaskReviewModalCtrl', TaskReviewModalCtrl);

AccountTaskerJobCtrl.$inject = ['$scope', '$rootScope', '$state', 'toastr', '$uibModal', '$translate', 'MainService', 'routes', '$cookieStore'];
TaskInviteViewModalInstanceCtrl.$inject = ['$uibModalInstance', 'TaskInvite', 'DefaultCurrency', 'Settings'];
TaskDetailsCancelModalInstanceCtrl.$inject = ['$translate', '$uibModalInstance', '$state', 'userid', 'status', 'toastr', 'cancelreason'];
TaskerExtraViewModalInstanceCtrl.$inject = ['$uibModalInstance', '$translate', 'Taskid', 'status', 'DefaultCurrency', 'toastr'];
TaskReviewModalCtrl.$inject = ['$uibModalInstance', 'TaskDetails', '$translate', 'toastr' ];

function AccountTaskerJobCtrl($scope, $rootScope, $state, toastr, $uibModal, $translate, MainService, routes, $cookieStore) {
    var ajc = this;
    if (angular.isDefined($rootScope.accountProfile) && angular.isDefined($rootScope.settings)) {
        ajc.user = $rootScope.accountProfile;
        ajc.getsettings = $rootScope.settings;
        //ajc.currency = $rootScope.defaultCurrency;
    }

    var userId = $rootScope.userId;

    ajc.taskitemsPerPage = 5;
    ajc.CurrentPage = 1;
    ajc.tasktotalItem = 0;
    ajc.taskInvitation = [];
    ajc.getwalletdetails = {};
    ajc.getsettings = {};
    ajc.taskInvitationDetails = [];
    ajc.tasker = [];
    ajc.getTaskDetailsByStausResponse = false;

    function taskChat(data) {
        $state.go('chat', data);
    }

    function getTaskDetailsByStaus(status, page) {
        ajc.taskInvitation = [];
        // ajc.getTaskDetailsByStausResponse = false;
        // ajc.tasktotalItem = 0;
        ajc.status = status;

        if (status == '6' || status == '7') {
            status = 'completed';
        } else if (status == '8') {
            status = 'cancelled';
        } else if (status == '2' || status == '3' || status == '4' || status == '5') {
            status = 'ongoing';
        } else if (status == '1') {
            status = 'assigned';
        }

        if (page == undefined) {
            ajc.CurrentPage = 1;
        } else {
            ajc.CurrentPage = page;
        }

        var data = {
            "_id": userId,
            "status": status,
            "skip": ajc.CurrentPage,
            "limit": ajc.taskitemsPerPage
        }

        if (ajc.searchTaskFrom) {
            data.taskfrom = moment(ajc.searchTaskFrom).format("DD-MMMM-YYYY");
        }

        if (ajc.searchTaskTo) {
            data.taskto = moment(ajc.searchTaskTo).format("DD-MMMM-YYYY");
        }

        MainService.getData(routes.taskerTaskDetails, data).then(function (response) {
            if (response.length > 0) {
                ajc.taskInvitationDetails = response;
                ajc.taskInvitation = response[0].TaskDetails;
                ajc.tasktotalItem = response[0].count;
            }
            ajc.getTaskDetailsByStausResponse = true;
        }).catch(function (err) {
            console.error('error = ', err);
        });
    }

    /***Search Tasks***/

    // --------------------------------------------------------
    // task cancelreason
    MainService.getData(routes.taskCancelReason, { type: ajc.user.role }).then(function (response) {
        $rootScope.settings_data = response.settings;
        if (angular.isDefined(response)) {
            ajc.getcancelreason = response.canceldata.length > 0 ? response : {}
            $scope.job_id = response.settings.bookingIdPrefix + '-';
        }
    }).catch(function (err) {
        console.error('err = ', err);
    });

    $scope.checkSearchDate = function() {
        if(ajc.searchTaskFrom > ajc.searchTaskTo) {
            ajc.searchTaskFrom = undefined;
            ajc.searchTaskTo = undefined;
            //toastr.error("Invalid date");
            $translate('INVALID DATE').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        } 
    };

    $scope.clearText = function(status, page) {
        //console.log("from date status, page  ",status, page)
        ajc.searchTaskFrom = undefined;
        getTaskDetailsByStaus(status, page)

    }

    $scope.clearText1 = function(status, page) {
        //console.log("to date status, page ",status, page)
        ajc.searchTaskTo = undefined;
        getTaskDetailsByStaus(status, page)
    }

    $scope.clearSearch = function() {
        ajc.searchTaskFrom = undefined;
        ajc.searchTaskTo = undefined;
        $scope.job_id = $rootScope.settings_data.bookingIdPrefix + '-';
        getTaskDetailsByStaus(ajc.status);
    };

    function getSearchTaskDetailsByStaus(status) {
        ajc.status = status;

        if (status == '6' || status == '7') {
            status = 'completed';
        } else if (status == '8') {
            status = 'cancelled';
        } else if (status == '2' || status == '3' || status == '4' || status == '5') {
            status = 'ongoing';
        } else if (status == '1') {
            status = 'assigned';
        }

        var data = {}
        /*var data = {
            "_id": userId,
            "status": status,
            "jobid": $scope.job_id,
            "taskfrom": ajc.searchTaskFrom,
            "taskto": ajc.searchTaskTo,
            "skip": ajc.CurrentPage,
            "limit": ajc.taskitemsPerPage
        }*/
        data._id = userId;
        data.jobid = $scope.job_id,
        data.status = status;
        data.skip = ajc.CurrentPage;
        data.limit = ajc.taskitemsPerPage;

        if (ajc.searchTaskFrom) {
            data.taskfrom = moment(ajc.searchTaskFrom).format("DD-MMMM-YYYY");
        }

        if (ajc.searchTaskTo) {
            data.taskto = moment(ajc.searchTaskTo).format("DD-MMMM-YYYY");
        }

        if($scope.job_id.length <= 4 && ajc.searchTaskFrom == undefined && ajc.searchTaskTo == undefined) {
            $translate('CHOOSE ATLEAST ONE SEARCH OPTION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }else {
            MainService.getSearchData(routes.searchTaskerTaskDetails, data).then(function (response) {
                if (response.length > 0) {
                    ajc.taskInvitationDetails = response;
                    ajc.taskInvitation = response[0].TaskDetails;
                    ajc.tasktotalItem = response[0].count;
                } else {
                    ajc.taskInvitation = [];
                    $translate('SEARCH RESULT NOT FOUND').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                }
                ajc.getTaskDetailsByStausResponse = true;
            }).catch(function (err) {
                console.error('error = ', err);
            });
        }
    };
    /***Ends***/

    // -----------------------------------------------------------------------
    // atc.action_menu = false;
    var flag = true;

    function actionMenu(index) { //for action button show
        if (flag) {
            ajc.action_menu = index;
            flag = false;
        } else {
            flag = true;
            ajc.action_menu = -1;
        }
    };


    // --------------------------------------------------------
    function TaskInviteViewModal(index) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'app/site/modules/accounts/views/taskinvite.view.modal.tab.html',
            controller: 'TaskInviteViewModalInstanceCtrl',
            controllerAs: 'TVMI',
            resolve: {
                TaskInvite: function () {
                    console.log('ajc.taskInvitation[index]', ajc.taskInvitation[index]);
                    return ajc.taskInvitation[index];
                },
                DefaultCurrency: function () {
                    return $rootScope.defaultCurrency;
                },
                Settings: function () {
                    return $rootScope.settings_data;
                }
            }
        });
        modalInstance.result.then(function (data) { }, function () { });
    }
    // -------------------------------------------------------------
    function taskRejectModal(id, status) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'app/site/modules/accounts/views/task-cancel.modal.tab.html',
            controller: 'TaskDetailsCancelModalInstanceCtrl',
            controllerAs: 'TDCMI',
            resolve: {
                userid: function () {
                    return id;
                },
                status: function () {
                    return status;
                },
                cancelreason: function () {
                    return ajc.getcancelreason;
                }
            }
        });
        modalInstance.result.then(function (taskignoredata) {
            MainService.getData(routes.ignoreTask, taskignoredata).then(function (response) {
                ajc.currentPage = 1;
                // getTaskDetailsByStaus('assigned');
                ajc.tabFourActive = true;

                if(response.nModified == 1){
                    $('#assigned').removeClass('new-active');
                    $('#cancelled').addClass('new-active');
                    getTaskDetailsByStaus('cancelled');
                }else{
                    getTaskDetailsByStaus("assigned");
                }

            }, function () {
                if (err.msg) {
                    $scope.addAlert(err.msg);
                } else {
                    // $state.go('account.tasks');
                    $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                }
            });
        }, function () { });
    };
    // --------------------------------------------------------------------
    function updatetaskstatus(taskid, status, currentpage) {
        var data = {};
        data.taskid = taskid;
        data.status = status;
        MainService.getData(routes.UpdateTaskStatus, { data: data }).then(function (response) {
            if (response.error) {
                $translate(response.error).then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
            } else {
                if (response.status == 3) {
                    //$translate('YOU START-OFF THE TASK').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
                    $translate('YOU START-OFF THE TASK').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                } else if (response.status == 4) {
                    $translate('YOU ARRIVED TO THE TASK LOCATION').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                } else if (response.status == 6) {
                    $translate('YOUR REQUEST FOR CASH').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                } else {
                    $translate('YOU STARTED TASK').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                }
            }
            getTaskDetailsByStaus("ongoing", currentpage);
            if (response.status == 6) {
                getTaskDetailsByStaus("completed");
            }
            ajc.currentPage = currentpage;
        }).catch(function (err) {
            console.error('err = ', err);
        });
    }
    // -----------------------------------------------------------
    function taskerconfirmtask(taskid, taskerid, status) {
        swal({
            title: $translate.instant('CONFIRM TASK'),
            text: $translate.instant('ARE YOU SURE WANT TO CONFIRM THIS TASK'),
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: $translate.instant('YES CONFIRM'),
            cancelButtonText: $translate.instant('CANCEL')
        }).then(function (response) {
            if (response) {
                var data = {};
                data.taskid = taskid;
                data.taskstatus = status;
                data.taskerid = taskerid;
                MainService.getData(routes.confirmTask, data).then(function (response) {                                                          
                    
                    if(response.nModified == 1){
                        $('#assigned').removeClass('new-active');
                        $('#ongoing').addClass('new-active');
                        getTaskDetailsByStaus('ongoing');
                    }else{
                        getTaskDetailsByStaus("assigned");
                    }

                    if (response.error) {
                        toastr.error(response.error);                        
                    } else if (response == "You have already booked a job in the chosen time, please choose a different time slot to perform job.") {
                        toastr.warning(response);                       
                    }
                    // getTaskDetailsByStaus("assigned");
                }).catch(function (err) {
                    if (err.msg) {
                        toastr.error(err.msg);
                    } else {
                        $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                    }
                });
            }
        }).catch(function (err) {
            // console.error('err - ',err);
        });
    };
    // --------------------------------------------------------------------------
    function TaskerextrapriceModal(taskid, status) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'app/site/modules/accounts/views/taskerextraprice.view.modal.tab.html',
            controller: 'TaskerExtraViewModalInstanceCtrl',
            controllerAs: 'TEVMI',
            resolve: {
                Taskid: function () {
                    return taskid;
                },
                status: function () {
                    return status;
                },
                DefaultCurrency: function () {
                    return $rootScope.defaultCurrency;
                }
            }
        });
        modalInstance.result.then(function (data) {
            MainService.getData(routes.taskComplete, data).then(function (response) {
                if (response.status == 6) {                    
                    $('#ongoing').removeClass('new-active');
                    $('#completed').addClass('new-active');
                    getTaskDetailsByStaus('completed');
                    $translate('TASK COMPLETED').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
                } else {
                    $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                    getTaskDetailsByStaus("ongoing");
                }
                // getTaskDetailsByStaus("ongoing");
                ajc.currentPage = 1;
            }).catch(function (err) {
                console.error('err= ', err);
            });
        });
    }

    function TaskReviewModal(index) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'app/site/modules/accounts/views/task-review.modal.html',
            controller: 'TaskReviewModalCtrl',
            controllerAs: 'TREM',
            resolve: {
                TaskDetails: function () {
                    return ajc.taskInvitation[index];
                }
            }
        });

        var userdata = ajc.taskInvitation[index];
        modalInstance.result.then(function (data) {
            console.log("dddaaaattttaaaa",data)
            var reviewdata = {};
            reviewdata.rating = data.review.rating;
            reviewdata.comments = data.review.comments;
            reviewdata.user = userdata.user._id;
            reviewdata.tasker = userdata.tasker;
            reviewdata.task = userdata._id;
            reviewdata.type = "tasker";
            MainService.getData(routes.insertReview, reviewdata).then(function (response) {
                getTaskDetailsByStaus("completed");
                // ajc.taskInvitation[index].taskrating = [];
                // ajc.taskInvitation[index].taskrating.push(reviewdata);
            }).catch(function (err) {
            });
        });
    }

    var notification_status = $cookieStore.get('notification_status')
    if(notification_status){         
        if(notification_status == 2 || notification_status == 3 || notification_status == 4 || notification_status == 5 ){
            $('#assigned').removeClass('new-active');
            $('#ongoing').addClass('new-active');
            getTaskDetailsByStaus("ongoing");
        }else if(notification_status == 6 || notification_status == 7){
            $('#assigned').removeClass('new-active');
            $('#completed').addClass('new-active');
            getTaskDetailsByStaus("completed");
        }else if(notification_status == 8){
            $('#assigned').removeClass('new-active');
            $('#cancelled').addClass('new-active');
            getTaskDetailsByStaus("cancelled");
        }else if(notification_status == 1){
            $('#assigned').addClass('new-active');           
            getTaskDetailsByStaus("assigned");
        }
        $cookieStore.remove('notification_status');        
    }else{
        getTaskDetailsByStaus("assigned");
    }

    angular.extend(ajc, {
        taskChat: taskChat,
        getTaskDetailsByStaus: getTaskDetailsByStaus,
        getSearchTaskDetailsByStaus: getSearchTaskDetailsByStaus,
        actionMenu: actionMenu,
        TaskInviteViewModal: TaskInviteViewModal,
        taskRejectModal: taskRejectModal,
        updatetaskstatus: updatetaskstatus,
        taskerconfirmtask: taskerconfirmtask,
        TaskReviewModal: TaskReviewModal,
        TaskerextrapriceModal: TaskerextrapriceModal
    });
}
// ------------------------- controlller ------------------------------
function TaskInviteViewModalInstanceCtrl($uibModalInstance, TaskInvite, DefaultCurrency, Settings) {
    var tvmi = this;
    tvmi.TaskInvite = TaskInvite;
    tvmi.DefaultCurrency = DefaultCurrency;
    //tvmi.getsettings = getsettings;

    tvmi.booking_date = moment(tvmi.TaskInvite.booking_information.booking_date).format(Settings.date_format + ' ' + Settings.time_format);
    tvmi.job_start_date = moment(tvmi.TaskInvite.history.job_started_time).format(Settings.date_format + ' ' + Settings.time_format);
    tvmi.job_end_date = moment(tvmi.TaskInvite.history.job_completed_time).format(Settings.date_format + ' ' + Settings.time_format);

    function ok(working_day, index) {
        var data = {};
        $uibModalInstance.close(data);
    };

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    };
    angular.extend(tvmi, {
        ok: ok,
        cancel: cancel
    });
};

function TaskDetailsCancelModalInstanceCtrl($translate, $uibModalInstance, $state, userid, status, toastr, cancelreason) {
    var tdcmi = this;
    tdcmi.userid = userid;
    tdcmi.taskstatus = status;
    tdcmi.cancelreason = cancelreason;
    tdcmi.other = 0;

    function ok(data) {
        if (data.reason || data.otherreason) {
            $uibModalInstance.close(tdcmi);

        } else {
            $translate('REASON FIELD IS EMPTY').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
    };

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    };

    function otherclick(other) {
        tdcmi.other = 1;
    };

    function click(other) {
        tdcmi.other = 0;
    };

    angular.extend(tdcmi, {
        ok: ok,
        cancel: cancel,
        otherclick: otherclick,
        click: click
    });
}


function TaskerExtraViewModalInstanceCtrl($uibModalInstance, $translate, Taskid, status, DefaultCurrency, toastr) {
    var tevmi = this;
    tevmi.defaultcurrency = DefaultCurrency;
    tevmi.addmaterial = false;
    tevmi.total = 0;
    tevmi.choices = [];

    function addNewChoice() {
        var newItemNo = tevmi.choices.length + 1;
        if (tevmi.choices.length > 0) {
            if (tevmi.newchoice) {
                if (tevmi.newchoice.name[tevmi.choices.length - 1] && tevmi.newchoice.value[tevmi.choices.length - 1]) {
                    tevmi.choices.push({ 'id': 'choice' + newItemNo });
                }
            }
        } else {
            tevmi.choices.push({ 'id': 'choice' + newItemNo });
        }
        tevmi.calculateChoice();
    };

    tevmi.calculateChoice = function () {
        tevmi.total = 0;
        if (tevmi.newchoice) {
            for (var i = 0; i < tevmi.choices.length; i++) {
                if (tevmi.newchoice.value[i]) {
                    tevmi.total = tevmi.total + parseFloat(tevmi.newchoice.value[i])
                }
            }
        }
    };

    function removeChoice() {
        var lastItem = tevmi.choices.length - 1;
        if (lastItem != 0) {
            if (tevmi.newchoice) {
                tevmi.newchoice.value[lastItem] = '';
                tevmi.newchoice.name[lastItem] = '';
            }
            tevmi.choices.pop({ 'id': 'choice' + lastItem });
        } else {
            tevmi.addmaterial = false;
            tevmi.newchoice.value[lastItem] = '';
            tevmi.newchoice.name[lastItem] = '';
            tevmi.choices.pop({ 'id': 'choice' + lastItem });
        }
        tevmi.calculateChoice();
    };


    tevmi.taskid = Taskid;
    tevmi.defaultCurrency = DefaultCurrency;
    tevmi.status = status;
    var newdata = [];

    function ok(test, valid) {
        if (!valid && test.addmaterial == true) {
            $translate('PLEASE ENTER ALL FIELD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        } else {
            if (test.newchoice && test.choices.length > 0) {
                for (var i = 0; i < test.choices.length; i++) {
                    var data = {};
                    data.name = test.newchoice.name[i];
                    data.price = parseFloat((test.newchoice.value[i] / tevmi.defaultCurrency.value).toFixed(2));
                    newdata.push(data);
                }

                tevmi.newdata = newdata;
                $uibModalInstance.close(tevmi);
            } else {
                if (tevmi.addmaterial == true) {
                    $translate('PLEASE ENTER ALL FIELD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
                } else {
                    var data = {}
                    data.taskid = test.taskid;
                    data.status = test.status;
                    $uibModalInstance.close(data);
                }
            }
        }
    };

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    };

    angular.extend(tevmi, {
        cancel: cancel,
        ok: ok,
        removeChoice: removeChoice,
        addNewChoice: addNewChoice
    });
};

function TaskReviewModalCtrl($uibModalInstance, TaskDetails, $translate, toastr) {
    // console.log('modalll');
    var trem = this;
    trem.TaskDetails = TaskDetails;

    function ok(valid) {
        if(valid) {
            $uibModalInstance.close(trem);
            $translate('RATING SUBMITTED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
        } else {
            $translate('FORM IS INVALID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
        
    };

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    };

    angular.extend(trem, {
        cancel: cancel,
        ok: ok,
    });
};
