    angular.module('handyforall.accounts')
    .controller('AccountDocumentCtrl', AccountDocumentCtrl)
    .controller('DocumentModalInstanceCtrl', DocumentModalInstanceCtrl);
AccountDocumentCtrl.$inject = ['$scope', '$rootScope', '$state', 'toastr', 'TaskerDocumentResolve', 'TaskerTaskResolve', '$cookieStore','accountService', '$uibModal'];
DocumentModalInstanceCtrl.$inject = ['$scope', '$rootScope', '$state', 'toastr', 'accountService', '$uibModalInstance', '$translate'];

function AccountDocumentCtrl($scope, $rootScope, $state, toastr, TaskerDocumentResolve, TaskerTaskResolve, $cookieStore, accountService, $uibModal) {
    var adtc = this;    
    var currentUser = $rootScope.userId;
    adtc.currenttassker = TaskerDocumentResolve.result[0];
    adtc.taskerStatus = TaskerTaskResolve;
    adtc.allowDocUpload = true;

    if(adtc.taskerStatus == 'Tasker Engaged') {
        adtc.allowDocUpload = false;
    }
    
    adtc.showEditForm = function(docs) {
        if(adtc.allowDocUpload) {
            var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'app/site/modules/accounts/views/editdocument.modal.tab.html',
            controller: 'DocumentModalInstanceCtrl',
            controllerAs: 'DCM'
            });
            modalInstance.result.then(function (docdata) {
                var data = {};
                data.tasker = currentUser;
                data.doc_id = docs._id;
                data.doc_name = docs.name;
                data.doc = docdata;
                accountService.updateTaskerDocument(data).then(function (response) {
                    if(response.data == 'Success') {
                        toastr.success('Document Updated Successfully');
                        $state.reload();
                    } else {
                        toastr.error("Unable to update document");
                    }
                });
            });
        } else {
            toastr.warning("Kindly Complete Your Job(s) To Modify The Document");
        }
        
    };
}

function DocumentModalInstanceCtrl($scope, $rootScope, $state, toastr, accountService, $uibModalInstance, $translate) {
    var dcm = this;

    function updateTaskerDocument(doc) {
        dcm.docname = doc;
    };

    function loadFile(event) {
        dcm.output = document.getElementById('output');
        if(dcm.docname) {
            if(dcm.docname.type == 'image/jpg' || dcm.docname.type == 'image/jpeg' || dcm.docname.type == 'image/png') {
                dcm.output.src = URL.createObjectURL(event.target.files[0]);
            } else if(dcm.docname.type == 'application/pdf') {
                dcm.output.src = 'uploads/default/pdf.png';
            } else {
                dcm.output.src = 'uploads/default/doc.png';
            }
        }
    };

    function ok(valid, doc) {
        if (valid) {
            $uibModalInstance.close(dcm.docname);
        } else {
            $translate('KINDLY UPLOAD A DOCUMENT').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
        }
    };

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    };

    angular.extend(dcm, {
        updateTaskerDocument: updateTaskerDocument,
        loadFile: loadFile,
        ok: ok,
        cancel: cancel
    });

}