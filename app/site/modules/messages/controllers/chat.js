angular.module('handyforall.messages').controller('chatCtrl', chatCtrl);

chatCtrl.$inject = ['ChatServiceResolve', '$state', 'toastr', '$filter', 'AuthenticationService', 'TaskProfileResolve', 'MainService', '$stateParams', 'socket', '$scope', '$rootScope', 'TaskServiceResolve', 'TaskService', 'CurrentuserResolve', '$translate', '$uibModal', '$q','sios','Upload'];
function chatCtrl(ChatServiceResolve, $state, toastr, $filter, AuthenticationService, TaskProfileResolve, MainService, $stateParams, socket, $scope, $rootScope, TaskServiceResolve, TaskService, CurrentuserResolve, $translate, $uibModal, $q, sios, Upload) {
    var chat = this;
    var user = AuthenticationService.GetCredentials();
    chat.currentusertype = CurrentuserResolve.user_type;
    chat.taskerDetails = TaskProfileResolve;

    if (chat.currentusertype == 'user') {
        chat.CurrentType = "Tasker Name";
        if (TaskServiceResolve.tasker) {
            chat.UserName = TaskServiceResolve.tasker.username;
            // chat.currentname = TaskServiceResolve.tasker.name.first_name;
        } else {
            chat.UserName = chat.taskerDetails.username;
            chat.currentname = chat.taskerDetails.username;
            //chat.currentname = chat.taskerDetails.name.first_name;
        }

        MainService.getCurrentUsers(user.currentUser.user_id).then(function (result) {
            chat.currentUserData = result[0];
        }, function (error) {
            console.log("user.currentUser", user.currentUser);
            $translate('INIT CURRENT DATA ERROR').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
        });
    }
    if (chat.currentusertype == 'tasker') {
        chat.CurrentType = "User Name";
        if (TaskServiceResolve.tasker) {
            chat.UserName = TaskServiceResolve.user.username;
        // chat.currentname = TaskServiceResolve.user.name.first_name;
        } else {
            chat.UserName = chat.taskerDetails.username;
            chat.currentname = chat.taskerDetails.username;
        }

        MainService.getCurrentTaskers(user.currentUser.user_id).then(function (result) {
            chat.currentUserData = result[0];
        }, function (error) {
            $translate('INIT CURRENT DATA ERROR').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
        });
    }

    chat.currentUser = user.currentUser.user_id;

    chat.data = ChatServiceResolve;
    if (chat.data) {
        var data = {};
        data.task = $stateParams.task;
        data.user = $stateParams.user;
        data.tasker = $stateParams.tasker;
        data.type = user.currentUser.user_type;
        socket.emit('message status', data);
    }

    chat.messages = ChatServiceResolve.messages || [];
    chat.taskinfo = TaskServiceResolve;
    //console.log("TaskServiceResolve",TaskServiceResolve);

    $rootScope.$emit('notification', { user: $rootScope.userId, type: $rootScope.usertype });

    chat.typing = {};
    chat.typing.status = false;

    if (user.currentUser.user_type == 'tasker') {
        chat.typing.message = 'User is typing';
    } else if (user.currentUser.user_type == 'user') {
        chat.typing.message = 'Tasker is typing';
    }

    if (chat.taskinfo.hourly_rate) {
        chat.taskinfo.amount = parseFloat(chat.taskinfo.hourly_rate).toFixed(2);
    }
    else {
        chat.taskinfo.amount = $filter('filter')(chat.taskerDetails.taskerskills, { "childid": chat.taskinfo.category._id })[0].hour_rate;
    }

    if(chat.taskinfo.task_date) {
        chat.taskinfo.taskdate = moment(chat.taskinfo.task_date).format($rootScope.settings.date_format);
    }

    chat.send = function saveChat(message) {
        if (user.currentUser.user_type == 'tasker') {
            var data = { 'user': $stateParams.user, 'tasker': $stateParams.tasker, 'message': message, 'task': $stateParams.task, 'from': chat.currentUser, datatype: 'text' };
        } else if (user.currentUser.user_type == 'user') {
            var data = { 'user': $stateParams.user, 'tasker': $stateParams.tasker, 'message': message, 'task': $stateParams.task, 'from': chat.currentUser, datatype: 'text' };
        }
        if (message) {
            socket.emit('new message', data);
        }
        $scope.message = '';
    };

    chat.ontyping = function ontyping(message) {
        var data = {};
        if (user.currentUser.user_type == 'tasker') {
            data.from = $stateParams.tasker;
            data.to = $stateParams.user;
        } else if (user.currentUser.user_type == 'user') {
            data.from = $stateParams.user;
            data.to = $stateParams.tasker;
        }
        data.task = $stateParams.task;
        data.user = $stateParams.user;
        data.tasker = $stateParams.tasker;
        data.type = user.currentUser.user_type;

        socket.emit('start typing', data);
        lastTypingTime = (new Date()).getTime();

        setTimeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= 400) {
                socket.emit('stop typing', data);
            }
        }, 400);
    };

    chat.confirmatask = function confirmatask(message) {
        swal({
            title: $translate.instant('CONFIRM&BOOKING'),
            text: $translate.instant('ARE YOU SURE WANT TO CONFIRM THIS TASK'),
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: $translate.instant('YES, CONFIRM'),
            cancelButtonText: $translate.instant('CANCEL')
        }).then(function (response) {
            if (response) {
                var task = {};
                task.tasker = $stateParams.tasker;
                task.user = $stateParams.user;
                task.task = $stateParams.task;
                TaskService.confirmtask(task).then(function (result) {
                    if (result.status == 1) {
                        $translate('REQUEST HAS BEEN SENT TO TASKER SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                        $state.go('landing', { reload: false });
                    } else {
                        $translate('UNABLE TO BOOK THIS TASKER').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                    }
                }, function (error) {
                    toastr.error(error);
                });
            }
        }).catch(function (err) { });
    }

    chat.taskerconfirmtask = function taskerconfirmtask(message) {
        swal({
            title: $translate.instant('ACCEPT TASK'),
            text: $translate.instant('ARE YOU SURE WANT TO ACCEPT THIS TASK'),
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: $translate.instant('YES, ACCEPT'),
            cancelButtonText: $translate.instant('CANCEL')
        }).then(function (response) {
            if (response) {
                var task = {};
                task.tasker = $stateParams.tasker;
                task.user = $stateParams.user;
                task.task = $stateParams.task;
                TaskService.taskerconfirmtask(task).then(function (result) {
                    if (result.status == 1) {
                        $translate('TASK ACCEPTED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
                        $state.go('landing', { reload: false });
                    } else {
                        $translate('UNABLE TO ACCEPT THIS TASK').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
                    }
                }, function (error) {
                    toastr.error(error);
                });
            }
        }).catch(function (err) { });
    }

    chat.upload = function upload(datatype) {
        console.log("datatype", datatype);
        angular.element(document.querySelector('#' + datatype)).click();
    };

    chat.shareFiles = function shareFiles(datatype) {
        if (chat.attachment) {

            chat.loader = {};
            angular.forEach(chat.attachment, function (value, key) {

                var types = value.type.split("/");

                if(types[0] == datatype ){
                    var temp_id = new Date().getTime();
                    FileCompression(value, datatype).then(function (file) {

                        var data = {};
                        if (user.currentUser.user_type == 'tasker') {
                            data = { 'temp_id': temp_id, 'user': $stateParams.user, 'tasker': $stateParams.tasker, datatype: datatype, 'size': file.size, 'name': file.name, 'task': $stateParams.task, 'from': chat.currentUser };
                        } else if (user.currentUser.user_type == 'user') {
                            data = { 'temp_id': temp_id, 'user': $stateParams.user, 'tasker': $stateParams.tasker, datatype: datatype, 'size': file.size, 'name': file.name, 'task': $stateParams.task, 'from': chat.currentUser };
                        }

                        var message = {};
                        message.datatype = datatype;
                        message.from = chat.currentUser;
                        message.message = file.url;
                        message.temp_id = temp_id;
                        message.loader = 0;
                        chat.messages.push(message);

                        var size = 0;
                        var stream = ss.createStream();
                        chat.loader[temp_id] = 0;
                        sios.emit('share file', stream, data);

                        var blobStream = ss.createBlobReadStream(file);
                        blobStream.pipe(stream);
                        blobStream.on('data', function (chunk) {
                            size += chunk.length;
                            chat.loader[temp_id] = Math.floor(size / file.size * 100);
                        });
                        blobStream.on('end', function (chunk) {
                        });
                    });
                } else{
                   toastr.error('Please choose a correct file');
                }
            });
        }
    };

    var FileCompression = function FileCompression(file, type) {
        console.log("file", file);
        console.log("type", type);
        var deferred = $q.defer();
        if (type == 'image') {
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = new Image();
                img.src = e.target.result;
                img.onload = function () {

                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var width = img.width;
                    var height = img.height;
                    canvas.width = width;
                    canvas.height = height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    var dataURL = canvas.toDataURL(file.type, 0.5);

                    var blob = dataURItoBlob(dataURL);

                    var newfile = new File([blob], file.name, { type: file.type });
                    newfile.url = URL.createObjectURL(blob);
                    newfile.naturalHeight = img.height;
                    newfile.naturalWidth = img.width;

                    deferred.resolve(newfile);
                }
            };
            reader.readAsDataURL(file);
        } else {
            Upload.dataUrl(file, false).then(function (url) {
                file.url = url;
                deferred.resolve(file);
            });
        }
        return deferred.promise;
    };

    var dataURItoBlob = function dataURItoBlob(dataURI) {
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {
            type: mimeString
        });
    };


    //*********************** SOCKET LISTENER ******************************//

    function webupdatechat(data) {
        console.log("webupdatechat",data)
        if (chat.data.task == data.task && chat.data.tasker._id == data.tasker && chat.data.user._id == data.user) {
            var newMessage = true;
            if (data.messages[0].temp_id) {
                chat.messages = chat.messages.map(function(message) {
                    if (message.temp_id == data.messages[0].temp_id) {
                        delete data.messages[0].temp_id;
                        message = data.messages[0];
                        newMessage = false;
                    }
                    return message;
                });
            }            if (newMessage) {
                chat.messages.push(data.messages[0]);
            }
            //chat.messages.push(data.messages[0]);
            if (data.messages[0].from != chat.currentUser) {
                data.currentuserid = $rootScope.userId;
                data.usertype = $rootScope.usertype;
                socket.emit('single message status', data);
            }
            setTimeout(function () {
                $("#chatscroll").scrollTop($("#chatscroll").scrollTop() + $("#chatscroll .chat-cnt:last").position().top)
            }, 0);
        }
    }

    function singlemessagestatus(data) {
        console.log("singlemessagestatus",data)
        chat.messages = chat.messages.map(function (message) {
            if (message._id == data.messages[0]._id) {
                var usertype = chat.currentusertype;
                if (usertype == 'user') {
                    message.tasker_status = 2;
                } else if (usertype == 'tasker') {
                    message.user_status = 2;
                }
            }
            return message;
        });
    }

    function messagestatus(data) {
        if (chat.data.task == data.task && chat.data.tasker._id == data.tasker && chat.data.user._id == data.user) {
            chat.messages = data.messages;
        }
    }

    function starttyping(data) {
        if (chat.data.task == data.chat.task && chat.data.tasker._id == data.chat.tasker && chat.data.user._id == data.chat.user) {
            chat.typing.status = true;
        }
    }

    function stoptyping(data) {
        if (chat.data.task == data.chat.task && chat.data.tasker._id == data.chat.tasker && chat.data.user._id == data.chat.user) {
            chat.typing.status = false;
        }
    }

    socket.on('webupdatechat', webupdatechat);
    socket.on('single message status', singlemessagestatus);
    socket.on('message status', messagestatus);
    socket.on('start typing', starttyping);
    socket.on('stop typing', stoptyping);

    $scope.$on('$destroy', function (event) {
        socket.removeListener('webupdatechat', webupdatechat);
        socket.removeListener('single message status', singlemessagestatus);
        socket.removeListener('message status', messagestatus);
        socket.removeListener('start typing', starttyping);
        socket.removeListener('stop typing', stoptyping);
    });


}

angular.module('handyforall.messages').controller('ConfirmtaskModel', function ($uibModalInstance) {
    var ccm = this;
    ccm.ok = function () {
        $uibModalInstance.close('ok');
    };
    ccm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
