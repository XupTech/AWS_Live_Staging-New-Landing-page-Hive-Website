angular.module('handyforall.accounts')
    .controller('AccountProfileCtrl', AccountProfileCtrl)
    .controller('OTPModelCtrl', OTPModelCtrl);

AccountProfileCtrl.$inject = ['$scope', '$rootScope', '$translate', 'MainService', 'routes', 'toastr', 'AuthenticationService', '$cookieStore', '$state', '$uibModal'];
OTPModelCtrl.$inject = ['$scope', '$rootScope','$translate', 'toastr', '$uibModalInstance', 'MainService'];

function AccountProfileCtrl($scope, $rootScope, $translate, MainService, routes, toastr, AuthenticationService, $cookieStore, $state, $uibModal) {
    var acc = this;
    acc.phn = $rootScope.accountProfile.phone;
    $scope.currentUser = $rootScope.userId;
    // ------------------------------------------------------------------------------------------------------------------------------------------------
    // Croping Image
    $scope.visibleValue = false;
    $scope.myImage = '';
    acc.myCroppedImage = '';
    $scope.imageChangeValue = false;
    $scope.handleFileSelect = function (evt) {
        var file = evt.currentTarget.files[0];
        if(file.$errorParam == '1MB' || file.$error == 'pattern') {
            $scope.visibleValue = false;
            file = null;
        } else {
            $scope.visibleValue = true;
            $scope.imageChangeValue = true;
        }
        if(file) {
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    $scope.myImage = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        }
    };
    // End Croping
    // ------------------------------------------------------------------------------------------------------------------------------------------------
    if (angular.isDefined($rootScope.accountProfile)) {
        user = $rootScope.accountProfile || {};
        acc.account = $rootScope.accountProfile || {};
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------
    $scope.account = true;
    $scope.editProfile = false;
    $scope.editBtn = true;
    $rootScope.taskerotp = '';
    $rootScope.tasker_mobile = {};

    function EditProfileBtn() {
        $scope.editBtn = false;
        $scope.account = false;
        $scope.editProfile = true;
    };

    function CancelEditBtn() {
        $scope.editBtn = true;
        $scope.account = true;
        $scope.editProfile = false;
        console.log('view')
        $state.reload()
    };

    function UpdateUserProfile(isvalid, form) {
            if (isvalid) {
                $rootScope.mode = '';
                $rootScope.otp = '';
                $rootScope.mobile = {};
                acc.account.avatarBase64 = acc.myCroppedImage;

                MainService.checkMobileExists('user', acc.account.phone).then(function (userdata) {
                    if(userdata.length == 0) {
                        MainService.generateotp(acc.account.phone).then(function (otpdetails) {
                            if(otpdetails) {
                                var decrypted_otp = CryptoJS.AES.decrypt(otpdetails.otpkey, "handyforall");
                                $scope.showUserOTPForm = true;
                                $rootScope.otp = decrypted_otp.toString(CryptoJS.enc.Utf8);
                                $rootScope.mode = otpdetails.sms;
                                $rootScope.mobile = acc.account.phone;

                                var modalInstance = $uibModal.open({
                                    animation: true,
                                    templateUrl: 'app/site/modules/accounts/views/otp.modal.tab.html',
                                    controller: 'OTPModelCtrl',
                                    controllerAs: 'OTPC',
                                });
                                modalInstance.result.then(function(otp) {
                                    if($rootScope.otp == otp) {
                                        MainService.getData(routes.userUpdateAcc, acc.account).then(function (response) {
                                            if (response.status == 1) {
                                                console.log("response.message",response.message)
                                                $translate(response.message).then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                                                user = $rootScope.accountProfile || {};
                                                acc.account.phone = acc.phn;


                                            } else {
                                                if (response.result.nModified === 1) {
                                                    MainService.getData(routes.userProfile, { userId: acc.account._id }).then(function (user) {
                                                        if(user.result.length > 0) {
                                                            var userdata = AuthenticationService.GetCredentials();
                                                            $rootScope.siteglobals = {
                                                                currentUser: {
                                                                    username: user.result[0].username,
                                                                    user_id: user.result[0]._id,
                                                                    authdata: userdata.currentUser.authdata,
                                                                    user_type: userdata.currentUser.user_type,
                                                                    tasker_status: userdata.currentUser.tasker_status,
                                                                    avatar: user.result[0].avatar
                                                                }
                                                            };

                                                            $rootScope.currAccAvatar = user.result[0].avatar;
                                                            
                                                            $scope.visibleValue = false;
                                                            $cookieStore.remove("siteglobals");
                                                            $cookieStore.put('siteglobals', $rootScope.siteglobals);
                                                            $state.reload();
                                                            $translate('PROFILE UPDATED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                                                        }
                                                    });
                                                }
                                            }
                                        }).catch(function (err) {
                                            if(err.status == 400){
                                                $translate(err.data.msg).then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                                            }else{
                                                $translate('UNABLE TO UPDATE PROFILE SUCCESFULLY').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                                            }                  
                                        });
                                    } else {
                                        $translate('OTP MISMATCHED').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                                    }
                                });
                            } else {
                                $translate('UNABLE TO GENERATE OTP').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                            }
                        }); 
                    } else {
                        MainService.getData(routes.userUpdateAcc, acc.account).then(function (response) {
                            console.log("response", response);
                            if (response.status == 1) {
                                $translate(response.message).then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                                user = $rootScope.accountProfile || {};
                                acc.account.phone = acc.phn;
                            } else {
                                if (response.result.nModified === 1) {
                                    MainService.getData(routes.userProfile, { userId: acc.account._id }).then(function (user) {
                                        if(user.result.length > 0) {
                                            var userdata = AuthenticationService.GetCredentials();
                                            $rootScope.siteglobals = {
                                                currentUser: {
                                                    username: user.result[0].username,
                                                    user_id: user.result[0]._id,
                                                    authdata: userdata.currentUser.authdata,
                                                    user_type: userdata.currentUser.user_type,
                                                    tasker_status: userdata.currentUser.tasker_status,
                                                    avatar: user.result[0].avatar
                                                }
                                            };

                                            $rootScope.currAccAvatar = user.result[0].avatar;
                                            
                                            $scope.visibleValue = false;
                                            $cookieStore.remove("siteglobals");
                                            $cookieStore.put('siteglobals', $rootScope.siteglobals);
                                            $state.reload();
                                            $translate('PROFILE UPDATED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                                        }
                                    });
                                }
                            }
                        }).catch(function (err) {
                            console.log('err',err);
                            if(err.status == 400){
                                $translate(err.data.msg).then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                            }else{
                                $translate('UNABLE TO UPDATE PROFILE SUCCESFULLY').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                            }                  
                        });
                    }
                });
            }
            else {
                $translate('PLEASE ENTER ALL FIELD').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
            }
    }

    function UpdateTaskerProfile(isvalid,form) {
            if (isvalid) {
                acc.account.avatarBase64 = acc.myCroppedImage;

                $rootScope.mode = '';
                $rootScope.otp = '';
                $rootScope.mobile = {};

                MainService.checkMobileExists('tasker', acc.account.phone).then(function (taskerdata) {
                    if(taskerdata.length == 0) {
                        MainService.generateotp(acc.account.phone).then(function (otpdetails) {
                            if(otpdetails) {
                                var decrypted_otp = CryptoJS.AES.decrypt(otpdetails.otpkey, "handyforall");
                                $scope.showTaskerOTPForm = true;
                                $rootScope.otp = decrypted_otp.toString(CryptoJS.enc.Utf8);
                                $rootScope.mode = otpdetails.sms;
                                $rootScope.mobile = acc.account.phone;

                                var modalInstance = $uibModal.open({
                                    animation: true,
                                    templateUrl: 'app/site/modules/accounts/views/otp.modal.tab.html',
                                    controller: 'OTPModelCtrl',
                                    controllerAs: 'OTPC',
                                });
                                modalInstance.result.then(function(otp) {
                                    if($rootScope.otp == otp) {
                                        MainService.getData(routes.taskerUpdateAcc, acc.account).then(function (response) {
                                            if (response.status == 1) {
                                                $translate(response.message).then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });

                                            } else {
                                                if (response.result.nModified === 1) {
                                                    MainService.getData(routes.taskerProfile, { userId: acc.account._id }).then(function (user) {
                                                        if(user.result.length > 0) {
                                                            var userdata = AuthenticationService.GetCredentials();
                                                            $rootScope.siteglobals = {
                                                                currentUser: {
                                                                    username: user.result[0].username,
                                                                    user_id: user.result[0]._id,
                                                                    authdata: userdata.currentUser.authdata,
                                                                    user_type: userdata.currentUser.user_type,
                                                                    tasker_status: userdata.currentUser.tasker_status,
                                                                    avatar: user.result[0].avatar
                                                                }
                                                            };

                                                            $rootScope.currAccAvatar = user.result[0].avatar;
                                                            
                                                            $scope.visibleValue = false;
                                                            $cookieStore.remove("siteglobals");
                                                            $cookieStore.put('siteglobals', $rootScope.siteglobals);
                                                            $state.reload();
                                                            $translate('PROFILE UPDATED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                                                        }
                                                    });
                                                }
                                            }

                                        }).catch(function (err) {
                                            $translate('UNABLE TO UPDATE PROFILE SUCCESFULLY').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                                        });

                                    }
                                });
                            } else {
                                $translate('UNABLE TO GENERATE OTP').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                            }
                        });
                    } else {
                        MainService.getData(routes.taskerUpdateAcc, acc.account).then(function (response) {
                            if (response.status == 1) {
                                $translate(response.message).then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });

                            } else {
                                if (response.result.nModified === 1) {
                                    MainService.getData(routes.taskerProfile, { userId: acc.account._id }).then(function (user) {
                                        if(user.result.length > 0) {
                                            var userdata = AuthenticationService.GetCredentials();
                                            $rootScope.siteglobals = {
                                                currentUser: {
                                                    username: user.result[0].username,
                                                    user_id: user.result[0]._id,
                                                    authdata: userdata.currentUser.authdata,
                                                    user_type: userdata.currentUser.user_type,
                                                    tasker_status: userdata.currentUser.tasker_status,
                                                    avatar: user.result[0].avatar
                                                }
                                            };

                                            $rootScope.currAccAvatar = user.result[0].avatar;
                                            
                                            $scope.visibleValue = false;
                                            $cookieStore.remove("siteglobals");
                                            $cookieStore.put('siteglobals', $rootScope.siteglobals);
                                            $state.reload();
                                            $translate('PROFILE UPDATED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                                        }
                                    });
                                }
                            }

                        }).catch(function (err) {
                            $translate('UNABLE TO UPDATE PROFILE SUCCESFULLY').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                        });
                    }
                });
                
            } else {
                $translate('PLEASE ENTER ALL FIELD').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
            }
    }
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // acc.formatted_address = ''
    function accountPlaceChanged() {
        var place = this.getPlace();

        acc.lng = place.geometry.location.lng();
        acc.lat = place.geometry.location.lat();
        acc.formatted_address = place.formatted_address;
        var locationa = place;
        acc.account.address.formatted_address = place.formatted_address;
        acc.account.address.line1 = place.formatted_address;
        acc.account.address.line2 = '';

        if (locationa.name) {
            acc.account.address.line1 = locationa.name;
        }

        for (var i = 0; i < locationa.address_components.length; i++) {
            for (var j = 0; j < locationa.address_components[i].types.length; j++) {
                if (locationa.address_components[i].types[j] == 'neighborhood') {
                    if (acc.account.address.line1 != locationa.address_components[i].long_name) {
                        if (acc.account.address.line1 != '') {
                            acc.account.address.line1 = acc.account.address.line1 + ',' + locationa.address_components[i].long_name;
                        } else {
                            acc.account.address.line1 = locationa.address_components[i].long_name;
                        }
                    }
                }
                if (locationa.address_components[i].types[j] == 'route') {
                    if (acc.account.address.line1 != locationa.address_components[i].long_name) {
                        if (acc.account.address.line2 != '') {
                            acc.account.address.line2 = acc.account.address.line2 + ',' + locationa.address_components[i].long_name;
                        } else {
                            acc.account.address.line2 = locationa.address_components[i].long_name;
                        }
                    }

                }
                if (locationa.address_components[i].types[j] == 'street_number') {
                    if (acc.account.address.line2 != '') {
                        acc.account.address.line2 = acc.account.address.line2 + ',' + locationa.address_components[i].long_name;
                    } else {
                        acc.account.address.line2 = locationa.address_components[i].long_name;
                    }

                }
                if (locationa.address_components[i].types[j] == 'sublocality_level_1') {
                    if (acc.account.address.line2 != '') {
                        acc.account.address.line2 = acc.account.address.line2 + ',' + locationa.address_components[i].long_name;
                    } else {
                        acc.account.address.line2 = locationa.address_components[i].long_name;
                    }

                }
                if (locationa.address_components[i].types[j] == 'locality') {

                    acc.account.address.city = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'country') {

                    acc.account.address.country = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'postal_code') {

                    acc.account.address.zipcode = locationa.address_components[i].long_name;
                }
                if (locationa.address_components[i].types[j] == 'administrative_area_level_1' || locationa.address_components[i].types[j] == 'administrative_area_level_2') {
                    acc.account.address.state = locationa.address_components[i].long_name;
                }
            }
        }
    };
    // ------------------------------------------------------------------------------------
    // about section

    MainService.getData(routes.getQuestion, {}).then(function (response) {
        acc.getQuestion = response;
    }).catch(function (err) {
        console.error('error = ', err);
    });

    if (acc.account.profile_details) {
        if (acc.account.profile_details.length > 0) {
            acc.profileDetails = acc.account.profile_details.reduce(function (total, current) {
                total[current.question] = current.answer;
                return total;
            }, {});
        } else {
            acc.profileDetails = [];
            acc.account.profile_details = [];
        }
    }

    function UpdateTaskerAbout(isvalid, profileDetails) {
        if(isvalid) {
            var i = 0;
            for (var key in acc.profileDetails) {
                if (acc.account.profile_details.filter(function (obj) { return obj.question === key; })[0]) {
                    acc.account.profile_details[i].answer = acc.profileDetails[key];
                } else {
                    acc.account.profile_details.push({ 'question': key, 'answer': acc.profileDetails[key] });
                }
                i++;
            }
            var data = {
                '_id': acc.account._id,
                'profile_details': acc.account.profile_details
            }

            MainService.getData(routes.updateAbout, data).then(function (response) {
                if (response.nModified === 1) {
                    $translate('UPDATED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                } else {
                    $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                }
            }).catch(function (err) {
                console.log('error === ', err);
                $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
            });
        } else {
            $translate('PLEASE DESCRIBE ABOUT YOURSELF').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
        }
    };
    // ------------------------------------------------------------------------------
    angular.extend($scope, {
        user: user,
        EditProfileBtn: EditProfileBtn,
        CancelEditBtn: CancelEditBtn,
        UpdateUserProfile: UpdateUserProfile,
        UpdateTaskerProfile: UpdateTaskerProfile,
        accountPlaceChanged: accountPlaceChanged,
        UpdateTaskerAbout: UpdateTaskerAbout
    });
};

function OTPModelCtrl($scope, $rootScope, $translate, toastr, $uibModalInstance, MainService) {
    var otpc = this;

    if($rootScope.mode == 'development') {
        otpc.otp = $rootScope.otp;
    }
    
    function ok() {
        console.log("$rootScope.otp",$rootScope.otp)
        console.log("otpc.otp",otpc.otp)
        if($rootScope.otp != otpc.otp) {
            $translate('OTP MISMATCHED').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
        } else {
            $uibModalInstance.close(otpc.otp);
        }
    };

    function cancel() {
        otpc.otp = '';
        $uibModalInstance.dismiss('cancel');
    };

    function resend() {
        var data = {};
        data.code = $rootScope.mobile.code;
        data.phone = $rootScope.mobile.number;
        MainService.generateotp(data).then(function (response, err) {
            var decrypted_otp = CryptoJS.AES.decrypt(response.otpkey, "handyforall");
            if(response.sms == 'development') {
                otpc.otp = decrypted_otp.toString(CryptoJS.enc.Utf8);
                $rootScope.otp = decrypted_otp.toString(CryptoJS.enc.Utf8);
            } else {
                $rootScope.otp = decrypted_otp.toString(CryptoJS.enc.Utf8);
            }
            $translate('OTP SENT SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
        });
    }

    angular.extend(otpc, {
        ok: ok,
        cancel: cancel,
        resend: resend
    });
};