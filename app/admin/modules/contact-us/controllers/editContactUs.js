angular.module('handyforall.contactus').controller('editContactCtrl', editContactCtrl);
angular.module('handyforall.contactus').controller('EmailTemplateModalCtrl', EmailTemplateModalCtrl);

editContactCtrl.$inject = ['contactEditReslove', 'ContactService', 'toastr', '$state', '$filter','$uibModal'];
EmailTemplateModalCtrl.$inject = ['ContactService', '$uibModalInstance', 'toastr', '$state', '$filter','$modal'];

function editContactCtrl(contactEditReslove, ContactService, toastr, $state, $filter, $uibModal) {
    var edcc = this;
    edcc.editContactData = contactEditReslove[0];

    edcc.showTemplateModal = function showTemplateModal(mail) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/admin/modules/contact-us/views/mail_modal.html',
            controller: 'EmailTemplateModalCtrl',
            controllerAs: 'ETMC'
        });
        modalInstance.result.then(function (maildata) {
            if(maildata) {
                var data = {'id':mail, 'content':maildata };
                ContactService.sendMail(data).then(function (response) {
                    if (response.status == 1) {
                        toastr.success(response.message);
                        $state.go('app.contact.view');
                    } else {
                        toastr.error(response.message);
                    }
                });
            }
        }, function () {
            //toastr.error('Modal dismissed at: ' + new Date(), 'Error');
        });
    }
}

function EmailTemplateModalCtrl(ContactService, $uibModalInstance, toastr, $state, $filter, $modal) {
    var etmc = this;

    etmc.send = function(valid, maildata) {
        if(valid) {
            $uibModalInstance.close(maildata);
        } else {
            toastr.error('Please Fill All Mandatory Fields');
        }
    };

    etmc.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

};
