angular.module('handyforall.postheader').controller('editPostheaderCtrl', editPostheaderCtrl);

editPostheaderCtrl.$inject = ['toastr', '$state', 'PostheaderService', 'postheaderServiceResolve', '$stateParams', 'languageService','languageServiceListResolve'];

function editPostheaderCtrl(toastr, $state, PostheaderService, postheaderServiceResolve, $stateParams, languageService, languageServiceListResolve) {
    var ephc = this;
    ephc.editpostheaderData = postheaderServiceResolve;
    ephc.languagedata = languageServiceListResolve[0];
    if ($stateParams.id) {
        ephc.action = 'edit';
        ephc.breadcrumb = 'SubMenu.EDIT_POSTHEADER';
    } else {
        ephc.action = 'add';
        ephc.breadcrumb = 'SubMenu.ADD_POSTHEADER';
    }
    ephc.titlerefresh = true;
    ephc.descriptionrefresh = true;

    PostheaderService.getPostHeaderList().then(function (respo) {

        ephc.postHeaderListCount = respo[1];


        if ($stateParams.id) {

            ephc.submit = function submit(isValid) {
                if (isValid) {
                    ephc.editpostheaderData.postHeader = Object.values(ephc.editpostheaderData.postHeader)
                    PostheaderService.save(ephc.editpostheaderData).then(function (response) {
                        toastr.success('Postheader Updated Successfully');
                        $state.go('app.postheader.viewpostheader');
                    }, function (err) {
                        toastr.error('Unable to process your request');
                    });
                }
                else {
                    toastr.error('form is invalid');
                }
            };

        } else {
            if (ephc.postHeaderListCount >= 3) {
                toastr.error('Maximum Count for Postheader is 3, More Postheader Cannot be Added');
                $state.go('app.postheader.viewpostheader');
            } else {
                ephc.submit = function submit(isValid) {
                    if (isValid) {
                        ephc.editpostheaderData.postHeader = Object.values(ephc.editpostheaderData.postHeader)
                        PostheaderService.save(ephc.editpostheaderData).then(function (response) {
                            toastr.success('Postheader Added Successfully');
                            $state.go('app.postheader.viewpostheader');
                        }, function (err) {
                            toastr.error('Unable to process your request');
                        });
                    } else {
                        toastr.error('form is invalid');
                    }

                };
            }
        }
    });

    ephc.refreshChange = function (value, type) {
        if (value) {
            for (var i = 0; i < ephc.languagedata.length; i++) {
                if (ephc.languagedata[i].code != 'en') {
                    if (type == 'title') {
                        ephc.editpostheaderData.postHeader[i].title = value;
                        ephc.titlerefresh = false;
                    }else{
                        ephc.editpostheaderData.postHeader[i].description = value;
                        ephc.descriptionrefresh = false;
                    }
                }
                console.log("ephc.editpostheaderData.postHeader[i]",ephc.editpostheaderData.postHeader[i])
            }            
        }
    }
    if ($stateParams.id) {
        for (var i = 0; i < ephc.languagedata.length; i++) {
            var count = 0;
            for (var j = 0; j < ephc.editpostheaderData.postHeader.length; j++) {
                if (ephc.editpostheaderData.postHeader[j].lang_code == ephc.languagedata[i].code) {
                    count++;
                }
            }
            if (count == 0) {
                if (ephc.languagedata[i].code != 'en') {
                    var temp = {};
                    temp.lang_code = ephc.languagedata[i].code;
                    temp.lang_name = ephc.languagedata[i].value;
                    temp.title =ephc.editpostheaderData.title;
                    temp.description = ephc.editpostheaderData.description;
                    ephc.editpostheaderData.postHeader.push(temp);
                }
            }
        }
    }
}
