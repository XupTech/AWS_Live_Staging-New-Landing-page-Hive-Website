angular.module('handyforall.cancellation').controller('editCancellationCtrl', editCancellationCtrl);

editCancellationCtrl.$inject = ['editcancellationResolve', 'cancellationService', '$scope', 'toastr', '$state', '$stateParams', 'languageService', 'languageServiceListResolve'];

function editCancellationCtrl(editcancellationResolve, cancellationService, $scope, toastr, $state, $stateParams, languageService, languageServiceListResolve) {

    var ecal = this;
    ecal.editData = editcancellationResolve[0] || {};
    ecal.languagedata = languageServiceListResolve[0];
    if ($stateParams.id) {
        ecal.action = 'Edit';
        ecal.breadcrumb = 'SubMenu.CANCELLATION';
        ecal.tempReason = editcancellationResolve[0].reason;
    } else {
        ecal.action = 'Add';
        ecal.breadcrumb = 'SubMenu.CANCELLATION';
    }
    ecal.submit = function submit(isValid) {
        if (isValid) {
            cancellationService.save(ecal.editData).then(function (response) {
                if (ecal.action == 'edit') {
                    var action = "edited";
                } else {
                    var action = "added";
                }
                toastr.success('Cancellation reason ' + action + ' Successfully');
                $state.go('app.cancellation.list');
                var filedata = [];
                if (ecal.editData.reason && ecal.languagedata && ecal.languagedata.length > 0 && ecal.tempReason != ecal.editData.reason) {
                    ecal.languagedata.map(function (value, i) {
                        var temp = {};
                        temp.key = ecal.editData.reason;
                        temp.code = value.code;
                        temp.value = ecal.editData.reason;
                        filedata.push(temp);
                    })
                }
                if (filedata.length > 0) {
                    languageService.languageWrite(filedata)
                }
            }, function (err) {
                toastr.error('Unable to process your request');
            });
        } else {
            toastr.error('form is invalid');
        }

    };
    /*ecal.refresh = true;
    ecal.refreshChange = function (value) {
        if (value) {
            var temparr = [];
            for (var i = 0; i < ecal.languagedata.length; i++) {
                console.log("value",value)
                var temp = {};
                temp.code = ecal.languagedata[i].code;
                temp.value = value;
                temparr.push(temp);
            }
            ecal.finallanguage = temparr;
            ecal.refresh = false;
        }
    }*/

}
