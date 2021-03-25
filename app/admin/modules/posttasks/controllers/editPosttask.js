angular.module('handyforall.posttasks').controller('editPosttaskCtrl', editPosttaskCtrl);

editPosttaskCtrl.$inject = ['posttaskEditReslove', 'PosttaskService', 'toastr', '$state', '$stateParams', 'Slug', 'languageService', 'languageServiceListResolve'];

function editPosttaskCtrl(posttaskEditReslove, PosttaskService, toastr, $state, $stateParams, Slug, languageService, languageServiceListResolve) {
    var eptc = this;

    eptc.editpaymentData = {};
    eptc.editpaymentData = posttaskEditReslove[0];
    //eptc.editpaymentData = posttaskEditReslove[1];
    eptc.languagedata = languageServiceListResolve[0];

    console.log("posttaskEditReslove", posttaskEditReslove[0].length);

    if ($stateParams.id) {
        eptc.action = 'edit';
        eptc.breadcrumb = 'SubMenu.EDIT_PAYMENT_PRICE';
    } else {
        eptc.action = 'add';
        eptc.breadcrumb = 'SubMenu.TASKSPOST ADD';
    }

    PosttaskService.getSetting().then(function (response) {
        eptc.editsettingData = response[0].settings.site_url;
    })
    eptc.disbledValue = false;
  
    if (posttaskEditReslove[0].length >= 3) {
            toastr.error('Maximum Count For Payment Price is 3, More Payment Prices Cannot be Added');
            $state.go('app.posttasks.list');
        } else {
    
        eptc.submit = function submit(isValid, data) {
            if (isValid) {
                eptc.disbledValue = true;
                data.postTask = Object.values(data.postTask)
                PosttaskService.savepaymentprice(data).then(function (response) {
                    console.log("response", response);
                    toastr.success('Payment Price Added Successfully');
                    $state.go('app.posttasks.list', { page: $stateParams.page, items: $stateParams.items });
                }, function (err) {
                    toastr.error('Unable to process your request');
                });
            } else {
                toastr.error('form is invalid');
            }

        };
    }
    eptc.namerefresh = true;
    eptc.descriptionrefresh = true;
    eptc.refreshChange = function (value, type) {
        console.log("value, type", value, type);
        if (value) {
            for (var i = 0; i < eptc.languagedata.length; i++) {
                if (eptc.languagedata[i].code != 'en') {
                    console.log("value, type", value, type)
                    if (type == 'name') {
                        eptc.editpaymentData.postTask[i].name = value;
                        eptc.namerefresh = false;
                    } else {
                        eptc.editpaymentData.postTask[i].description = value;
                        eptc.descriptionrefresh = false;
                    }
                }
                console.log("eptc.editpaymentData.postTask[i]", eptc.editpaymentData.postTask[i])
            }
        }
    }

    if ($stateParams.id) {
        for (var i = 0; i < eptc.languagedata.length; i++) {
            console.log("eptc.languagedata.length",eptc.languagedata.length);
            var count = 0;
            for (var j = 0; j < eptc.editpaymentData.postTask.length; j++) {
                if (eptc.editpaymentData.postTask[j].lang_code == eptc.languagedata[i].code) {
                    count++;
                }
            }
            if (count == 0) {
                if (eptc.languagedata[i].code != 'en') {
                    var temp = {};
                    temp.lang_code = eptc.languagedata[i].code;
                    temp.lang_name = eptc.languagedata[i].value;
                    temp.name = eptc.editpaymentData.name;
                    temp.description = eptc.editpaymentData.description;
                    eptc.editpaymentData.postTask.push(temp);
                    console.log("eptc.editpaymentData.postTask",eptc.editpaymentData.postTask);
                    
                }
            }
        }
    } 
    
    // else {
        // eptc.editpaymentData = {};
        // console.log("eptc.editpaymentData.postTask", eptc.editpaymentData);
        // eptc.editpaymentData.postTask = [];
        // console.log("eptc.editpaymentData.postTask", eptc.editpaymentData.postTask);
        // for (var i = 0; i < eptc.languagedata.length; i++) {
        //     console.log("eptc.languagedata[i].code",eptc.languagedata[i].code);
        //     console.log("eptc.languagedata[i].code",eptc.languagedata.length);
            
        //     if (eptc.languagedata[i].code != 'en') {
        //         var temp = {};
        //         temp.lang_code = eptc.languagedata[i].code;
        //         temp.lang_name = eptc.languagedata[i].value;
        //         console.log("temp",temp);
                
        //         eptc.editpaymentData.postTask.push(temp);
        //     }
        // }
        // console.log("eptc.editpaymentData.postTask", eptc.editpaymentData.postTask);

    // }



}
