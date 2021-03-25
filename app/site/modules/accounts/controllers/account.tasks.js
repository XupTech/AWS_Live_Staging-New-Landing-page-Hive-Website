angular.module('handyforall.accounts')
    .controller('AccountTasksCtrl', AccountTasksCtrl)
    .controller('TaskViewModalInstanceCtrl', TaskViewModalInstanceCtrl)
    .controller('TaskCancelModalInstanceCtrl', TaskCancelModalInstanceCtrl)
    .controller('AddReviewModalInstanceCtrl', AddReviewModalInstanceCtrl)
    .controller('TaskDetailsViewforstatusModalInstanceCtrl', TaskDetailsViewforstatusModalInstanceCtrl);

AccountTasksCtrl.$inject = ['$scope', '$rootScope', 'toastr', '$stateParams', 'MainService', 'accountService', 'routes', '$uibModal', '$state', '$cookieStore', '$translate'];
TaskViewModalInstanceCtrl.$inject = ['$uibModalInstance', 'TaskDetails', 'DefaultCurrency', 'Settings'];
TaskCancelModalInstanceCtrl.$inject = ['$uibModalInstance', 'userid', 'status', 'cancelreason', 'toastr', '$translate'];
AddReviewModalInstanceCtrl.$inject = ['$uibModalInstance', 'TaskDetails', '$scope', '$state', '$translate', 'toastr'];
TaskDetailsViewforstatusModalInstanceCtrl.$inject = ['$uibModalInstance', 'TaskDetails', 'defaultcurrency'];

function AccountTasksCtrl($scope, $rootScope, toastr, $stateParams, MainService, accountService, routes, $uibModal, $state, $cookieStore, $translate) {
    var atc = this;

    if (angular.isDefined($rootScope.accountProfile) && angular.isDefined($rootScope.defaultCurrency)) {
        atc.user = $rootScope.accountProfile;
        //atc.currency = $rootScope.defaultCurrency;
    }   

    // ----------------------------------------------------------------------------------
    atc.itemsPerPage = 5;
    atc.totalItem = 0;
    atc.taskList = [];
    atc.taskinfobyid = [];
    atc.getTaskListResponse = false;
    atc.taskListCurrentPage = 1;
    var userId = $rootScope.userId;
    var flag = true;

    function getTaskLists(status, page) { //status = all, assigned, ongoing, completed, cancelled
        atc.status = status;
        atc.taskList = [];
        atc.getTaskListResponse = false;
        if (page == undefined) {
            atc.taskListCurrentPage = 1;
        } else {
            atc.taskListCurrentPage = page;
        }

        var data = {}
        data._id = userId;
        data.status = status;
        data.skip = atc.taskListCurrentPage;
        data.limit = atc.itemsPerPage;

        if (atc.searchTaskFrom) {
            data.taskfrom = moment(atc.searchTaskFrom).format("DD-MMMM-YYYY");
        }

        if (atc.searchTaskTo) {
            data.taskto = moment(atc.searchTaskTo).format("DD-MMMM-YYYY");
        }

        atc.action_menu = -1; // Menu Close
        flag = true;


        MainService.getData(routes.taskList, data).then(function (response) {
            if (response.length > 0) {
                atc.taskList = response[0].TaskDetails;
                atc.totalItem = response[0].count;
            }
            atc.getTaskListResponse = true;
        }).catch(function (err) {
            console.error('err = ', err);
        });
    };

    /***Search Tasks***/

    // ---------------------------------------------------------------------
    // task cancellation service
    MainService.getData(routes.taskCancelReason, { type: atc.user.role }).then(function (response) {
        $rootScope.settings_data = response.settings;
        if (angular.isDefined(response)) {
            atc.getcancelreason = response.canceldata.length > 0 ? response : {}
            $scope.job_id = response.settings.bookingIdPrefix + '-';
        }
    }).catch(function (err) {
        console.error('err = ', err);
    });


    $scope.checkSearchDate = function() {
        if(atc.searchTaskFrom > atc.searchTaskTo) {
            atc.searchTaskFrom = undefined;
            atc.searchTaskTo = undefined;
            //toastr.error("Invalid date");
            $translate('INVALID DATE').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        } 
    };

    $scope.clearText = function(status, page) {
        //console.log("from date status, page  ",status, page)
        atc.searchTaskFrom = undefined;
        getTaskLists(status, page)

    }

    $scope.clearText1 = function(status, page) {
        //console.log("to date status, page ",status, page)
        atc.searchTaskTo = undefined;
        getTaskLists(status, page)
    }

    $scope.clearSearch = function() {
        atc.searchTaskFrom = undefined;
        atc.searchTaskTo = undefined;
        $scope.job_id = $rootScope.settings_data.bookingIdPrefix + '-';
        getTaskLists(atc.status);
    };

    function getSearchTaskLists() { 
        var data = {};
        data._id = userId;
        data.status = atc.status;
        data.jobid = $scope.job_id;
        data.taskfrom = atc.searchTaskFrom;
        data.taskto = atc.searchTaskTo;
        data.limit = atc.itemsPerPage;
        data.skip = atc.taskListCurrentPage;

        atc.action_menu = -1; // Menu Close
        flag = true;

        if($scope.job_id.length <= 4 && atc.searchTaskFrom == undefined && atc.searchTaskTo == undefined) {
            $translate('CHOOSE ATLEAST ONE SEARCH OPTION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        } else {
            if (data.taskfrom) {
                data.taskfrom = moment(data.taskfrom).format("DD-MMMM-YYYY");
            }

            if (data.taskto) {
                data.taskto = moment(data.taskto).format("DD-MMMM-YYYY");
            }
            
            MainService.getSearchData(routes.taskSearchList, data).then(function (response) {
                if (response.length > 0) {
                    atc.taskList = response[0].TaskDetails;
                    atc.totalItem = response[0].count;
                } else {
                    atc.taskList = [];
                    $translate('SEARCH RESULT NOT FOUND').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                }
                atc.getTaskListResponse = true;
            }).catch(function (err) {
                console.error('err = ', err);
            });
        }
    };
    /***Ends***/

    // for view task action
    function taskDetailsViewModal(index) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'app/site/modules/accounts/views/taskdetails.view.modal.tab.html',
            controller: 'TaskViewModalInstanceCtrl',
            controllerAs: 'TDVMI',
            resolve: {
                TaskDetails: function () {

                    return atc.taskList[index];
                },
                Settings: function() {
                    return $rootScope.settings_data;
                },
                DefaultCurrency: function () {
                    return $rootScope.defaultCurrency;
                }

            }
        });
    }

    // -----------------------------------------------------------------------
    // atc.action_menu = false;


    function actionMenu(index) { //for action button show
        if (flag) {
            atc.action_menu = index;
            flag = false;
        } else {
            flag = true;
            atc.action_menu = -1;
        }
    };

    function taskChat(data) {
        $state.go('chat', data);
    }

    function taskPayment(data) {
        $state.go('carddeatil', data);
    }

    // for cancel task action
    function taskCancelModal(id, status) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'app/site/modules/accounts/views/task-cancel.modal.tab.html',
            controller: 'TaskCancelModalInstanceCtrl',
            controllerAs: 'TDCMI',
            resolve: {
                userid: function () {
                    return id;
                },
                status: function () {
                    return status;
                },
                cancelreason: function () {
                    return atc.getcancelreason;
                }

            }
        });

        modalInstance.result.then(function (taskcanceldata ) {
            MainService.getData(routes.taskCancel, taskcanceldata).then(function (response) {
                
                $('#assigned').removeClass('new-active');
                $('#cancelled').addClass('new-active');
                atc.getTaskLists("cancelled");

               /*  if(response.nModified && response.nModified == 1){
                    toastr.success("job cancelled");
                }

                if(response.status && response.status == 0 || '0'){
                    toastr.error("Action Not Permitted");
                } */
                atc.taskCurrentPage = 1;
                // atc.getTaskLists("ongoing");
                // getTaskLists('cancelled', atc.taskCurrentPage);
            }).catch(function (err) {
                console.error('err = ', err);
                // toastr.error(err.msg);
            });
        });
    };
    // -----------------------------------------------------------------------
    // for review action
    function addReviewModal(taskdetails) {
        MainService.getData(routes.taskReview, { taskid: taskdetails._id }).then(function (response) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/site/modules/accounts/views/userreview.modal.tab.html',
                controller: 'AddReviewModalInstanceCtrl',
                controllerAs: 'ARM',
                resolve: {
                    TaskDetails: function () {
                        return taskdetails;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                MainService.getData(routes.addUserReview, data).then(function (response) {
                    atc.reviewdata = response;
                    atc.getTaskLists("completed");
                });
            });
        });
    }
    // -----------------------------------------------------------------------
    function taskDetailsViewModalforstatus(index) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'app/site/modules/accounts/views/taskdetailsforstatus.modal.tab.html',
            controller: 'TaskDetailsViewforstatusModalInstanceCtrl',
            controllerAs: 'TDVSMI',
            resolve: {
                TaskDetails: function () {
                    return atc.taskList[index];
                },
                defaultcurrency: function () {
                    return $rootScope.defaultCurrency;
                }

            }
        })
    }

    var notification_status = $cookieStore.get('notification_status')
    if(notification_status){        
        if(notification_status == 2 || notification_status == 3 || notification_status == 4 || notification_status == 5 ){
            $('#assigned').removeClass('new-active');
            $('#ongoing').addClass('new-active');
            getTaskLists("ongoing");
        }else if(notification_status == 6 || notification_status == 7){
            $('#assigned').removeClass('new-active');
            $('#completed').addClass('new-active');
            getTaskLists("completed");
        }else if(notification_status == 8){
            $('#assigned').removeClass('new-active');
            $('#cancelled').addClass('new-active');
            getTaskLists("cancelled");
        }else if(notification_status == 1){
            $('#cancelled').addClass('new-active');           
            getTaskLists("assigned");
        }
         $cookieStore.remove('notification_status');        
    }else{
        getTaskLists("assigned");
    }    
    

    // ----------------------------------------------------------------------
    angular.extend(atc, {
        getTaskLists: getTaskLists,
        getSearchTaskLists: getSearchTaskLists,
        taskChat: taskChat,
        taskPayment: taskPayment,
        taskDetailsViewModal: taskDetailsViewModal,
        actionMenu: actionMenu,
        taskCancelModal: taskCancelModal,
        addReviewModal: addReviewModal,
        taskDetailsViewModalforstatus: taskDetailsViewModalforstatus
    });
};
// --------------------------------------------------------  controllers ------------------------------------------------------------------------------------
function TaskViewModalInstanceCtrl($uibModalInstance, TaskDetails, DefaultCurrency, Settings) {
    var tdvmi = this;
    tdvmi.TaskDetails = TaskDetails;
    tdvmi.DefaultCurrency = DefaultCurrency;
    tdvmi.taskdescription = TaskDetails.task_description;

    tdvmi.booking_date = moment(tdvmi.TaskDetails.booking_information.booking_date).format(Settings.date_format + ' ' + Settings.time_format);
    tdvmi.job_start_date = moment(tdvmi.TaskDetails.history.job_started_time).format(Settings.date_format + ' ' + Settings.time_format);
    tdvmi.job_end_date = moment(tdvmi.TaskDetails.history.job_completed_time).format(Settings.date_format + ' ' + Settings.time_format);

    /*if (tdvmi.TaskDetails && tdvmi.TaskDetails.invoice && tdvmi.TaskDetails.invoice.worked_human_hours) {
        var human_hours = tdvmi.TaskDetails.invoice.worked_human_hours;
        if (human_hours != 0) {
            
        }
    }*/

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    };

    angular.extend(tdvmi, {
        cancel: cancel
    });
};

function TaskCancelModalInstanceCtrl($uibModalInstance, userid, status, cancelreason, toastr, $translate) {
    var tdcmi = this;
    tdcmi.userid = userid;
    tdcmi.taskstatus = status;
    tdcmi.cancelreason = cancelreason;
    tdcmi.other = 0;

    function ok(data) {
        if (data.reason || data.otherreason) {
            $uibModalInstance.close(tdcmi);
        } else {
            $translate('REASON FIELD IS EMPTY').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
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
        click: click,
        otherclick: otherclick,
        cancel: cancel,
        ok: ok

    });
};

function AddReviewModalInstanceCtrl($uibModalInstance, TaskDetails, $scope, $state, $translate, toastr) {
    var arm = this;
    arm.user = TaskDetails.user;
    arm.tasker = TaskDetails.tasker._id;
    arm.task = TaskDetails._id;
    arm.type = 'user';

    function ok(valid) {
        if(valid) {
            $uibModalInstance.close(arm);
            $translate('RATING SUBMITTED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
            $state.go('account.tasks');
        } else {
            $translate('FORM IS INVALID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
    };

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    };

    angular.extend(arm, {
        cancel: cancel,
        ok: ok

    });
};

function TaskDetailsViewforstatusModalInstanceCtrl($uibModalInstance, TaskDetails, defaultcurrency) {
    var tdvsmi = this;
    tdvsmi.defaultcurrency = defaultcurrency;
    tdvsmi.TaskDetails = TaskDetails;
    var a = TaskDetails.invoice.worked_hours;
    var hours = Math.trunc(a / 60);
    var minutes = a % 60;

    if (hours == 0) {
        if (minutes == 0.1) {
            tdvsmi.Task_time = minutes + " min";
        } else {
            tdvsmi.Task_time = minutes + " mins";
        }

    } else {
        tdvsmi.Task_time = hours + " hours " + minutes + " mins";
    }

    tdvsmi.taskdescription = TaskDetails.task_description;

    function ok() {
        $uibModalInstance.close();
    };

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    };

    angular.extend(tdvsmi, {
        ok: ok,
        cancel: cancel
    });
}
// -----------------------------------------------------------------------------------------------------------------------------------------------------------
