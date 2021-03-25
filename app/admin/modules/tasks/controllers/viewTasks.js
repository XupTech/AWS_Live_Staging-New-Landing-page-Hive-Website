angular.module('handyforall.tasks').controller('viewTasksCtrl', viewTasksCtrl);

viewTasksCtrl.$inject = ['TasksServiceResolve', 'TasksService', '$scope', 'toastr', '$rootScope'];

function viewTasksCtrl(TasksServiceResolve, TasksService, $scope, toastr, $rootScope) {

    var tlc = this;
    tlc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "tasks");
    }).map(function (menu) {
        return menu.status;
    })[0];

    if (TasksServiceResolve[2]) {
        tlc.allValue = TasksServiceResolve[2].allValue || 0;
        tlc.onGoingValue = TasksServiceResolve[2].onGoingValue || 0;
        tlc.comlpleteValue = TasksServiceResolve[2].completedValue || 0;
        tlc.cancellValue = TasksServiceResolve[2].cancelValue || 0;
    }

    $scope.today = function () {
        //tlc.fromDate = new Date();
        //tlc.toDate = new Date();
        tlc.fromDate = undefined;
        tlc.toDate = undefined;
    };

    $scope.today();

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.status = {
        opened: false
    };

    $scope.status = {
        opened1: false
    };

    $scope.open = function ($event) {
        $scope.status.opened = true;
    };

    $scope.open1 = function ($event) {
        $scope.status.opened1 = true;
    };


    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        'class': 'datepicker'
    };

    $scope.checkSearchDate = function() {
        if(tlc.fromDate > tlc.toDate) {
            tlc.fromDate = undefined;
            tlc.toDate = undefined;
            toastr.error("Invalid date");
        } 
    };


    $scope.clearText = function(status, page) {
        tlc.fromDate = undefined;
        tlc.replacelist();
    }

    $scope.clearText1 = function(status, page) {
        tlc.toDate = undefined;
        tlc.replacelist();
    }

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.statusValue = 0;
    tlc.statusPass = function statusPass(status, limit, skip) {
        $scope.statusValue = status;
        if (status == 1 || status == 7 || status == 8 || status == 0) {
            tlc.searchData = {};
            if (tlc.fromDate) {
                tlc.searchData.from = tlc.fromDate;
            }
            if (tlc.toDate) {
                tlc.searchData.to = tlc.toDate;
            }
            TasksService.getTasksList(status, limit, skip, 0, undefined,tlc.searchData).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1] || 0;
                if (respo[2]) {
                    tlc.allValue = respo[2].allValue || 0;
                    tlc.onGoingValue = respo[2].onGoingValue || 0;
                    tlc.comlpleteValue = respo[2].completedValue || 0;
                    tlc.cancellValue = respo[2].cancelValue || 0;
                }
            });
        }
    };

    TasksService.getSettings().then(function (response) {
        tlc.getsetting = response;
    });

    tlc.exportTask = function exportTask() {
        TasksService.exportData().then(function (response) {
            console.log(">>>>>>>>>>>>>>>>>>>", response);
            if (response.status == 0) {
                toastr.error('No data found to export');
            } else {
                //window.location.href = tlc.getsetting.site_url + "tools/taskexport";
                window.location.href = tlc.getsetting.site_url + "admin/download-file/" + response.message.type + "/" + response.message.filename;

            }
        }, function (err) {
            toastr.error(err);
        });
    }

    var layout = [
        {
            name: 'Task ID',
            template: '{{content.booking_id}}',
        },
        {
            name: 'Task Category',
            template: '{{content.category}}',
            sort: 1,
            variable: 'category'
        },
        {
            name: $rootScope.user,
            template: '{{content.user}}',
            sort: 1,
            variable: 'user'
        },
        {
            name: $rootScope.tasker,
            template: '{{content.tasker}}',
            sort: 1,
            variable: 'tasker'
        },
        {
            name: 'Last Updated',
            //template: '{{content.updatedAt | date}}',
            template: "<div>{{content.updatedAt | date:'yyyy-MM-dd hh:mm:ss'}} </div>",
            sort: 1,
            variable: 'updatedAt'
        },
        {
            name: 'Status ',
            template:
            '<div ng-if="content.status==0">Delete</div>' +
            '<div ng-if="content.status==1">Pending </div>' +
            '<div ng-if="content.status==2">Accepted </div>' +
            '<div ng-if="content.status==3">StartOff </div>' +
            '<div ng-if="content.status==4">Arrived </div>' +
            '<div ng-if="content.status==5">StartJob </div>' +
            '<div ng-if="content.status==6">Payment Pending</div>' +
            '<div ng-if="content.status==7">Completed</div>' +
            '<div ng-if="content.status==8">Cancelled</div>' +
            '<div ng-if="content.status==9">Dispute</div>' +
            '<div ng-if="content.status==10">Search</div>' +
            '<div ng-if="content.status==11">Expired</div>'
        },
        {
            name: 'Actions',
            template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref=app.tasks.add({action:"edit",id:content._id})><i class="fa fa-eye"></i> <span>View</span></button>' +
            '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-disabled="content.status==8" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Cancel</span></button>'
        }
    ];

    tlc.table = {};
    tlc.table.layout = layout;
    tlc.table.data = TasksServiceResolve[0];
    tlc.table.count = TasksServiceResolve[1] || 0;
    tlc.table.entryLimit = 50;
    tlc.table.delete = {
        'permission': tlc.permission, service: '/tasks/deletequestion', getData: function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            tlc.searchData = {};
            if (tlc.fromDate) {
                tlc.searchData.from = tlc.fromDate;
            }
            if (tlc.toDate) {
                tlc.searchData.to = tlc.toDate;
            }
            TasksService.getTasksList($scope.statusValue, itemsPerPage, skip, sort, status, tlc.searchData).then(function (respo) {
                tlc.table.data = respo[0];
                tlc.table.count = respo[1];
            });
        }
    };

    tlc.replacelist = function replacelist() {
        tlc.table.layout = layout;
        tlc.searchData = {};
        if (tlc.fromDate) {
            tlc.searchData.from = moment(tlc.fromDate).format("DD-MMMM-YYYY");
        }
        if (tlc.toDate) {
            tlc.searchData.to = moment(tlc.toDate).format("DD-MMMM-YYYY");
        }
        
        if(!tlc.searchData.from && !tlc.searchData.to ) {
            toastr.error('Choose Atleast One Search Option');
        }
        TasksService.getTasksList($scope.statusValue,10, 0, 0, status, tlc.searchData).then(function (response) {    
            tlc.table.data = response[0];
            tlc.table.count = response[1];
        });
    }

}
