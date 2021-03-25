angular.module('handyforall.accounts')
    .controller('AccountInformationCtrl', AccountInformationCtrl);
AccountInformationCtrl.$inject = ['$scope', '$rootScope', '$state', 'toastr', '$translate', 'accountService', 'routes'];

function AccountInformationCtrl($scope, $rootScope, $state, toastr, $translate, accountService, routes) {
    var aic = this;

    if (angular.isDefined($rootScope.accountProfile)) {
        aic.user = $rootScope.accountProfile;
    }

    aic.banking = {};
    aic.banking = aic.user.banking;

    function saveAccInfo(isvalid, form) {
       
        if (aic.banking) {
            aic.banking.userId = aic.user._id;
        }

        if (isvalid) {
            accountService.saveaccountinfo(form).then(function (response) {
                if (response.data.nModified === 1) {
                    $translate('SAVED SUCCESSFULLY').then(function (headline) {
                        toastr.success(headline);
                        $state.reload();
                    }, function (headline) {
                        toastr.error(headline);
                    });
                }
                if (response.status === 0) {
                    $translate(response.message.msg).then(function (headline) {
                        toastr.error(headline);
                    }, function (headline) {
                        toastr.error(headline);
                    });
                }
            }).catch(function (err) {
                $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) {
                    toastr.error(headline);
                }, function (headline) {
                    toastr.error(headline);
                });
            });
        } else {
            $translate('PLEASE ENTER ALL FIELD').then(function (headline) {
                toastr.error(headline);
            }, function (headline) {
                toastr.error(headline);
            });
        }
    }


    angular.extend(aic, {
        saveAccInfo: saveAccInfo
    });
}