angular.module('handyforall.peoplecmd').controller('editPeoplecmdCtrl', editPeoplecmdCtrl);

editPeoplecmdCtrl.$inject = ['PeoplecmdEditReslove', 'PeoplecmdServiceResolve','PeoplecmdService', 'toastr', '$state', '$stateParams', 'Slug', 'languageService','languageServiceListResolve'];

function editPeoplecmdCtrl(PeoplecmdEditReslove, PeoplecmdServiceResolve, PeoplecmdService, toastr, $state, $stateParams, Slug, languageService, languageServiceListResolve) {
    var epcc = this;

    epcc.editpeopletData = PeoplecmdEditReslove[0];
    epcc.editpeopletData = {};
    epcc.editpeopletData = PeoplecmdEditReslove[1];
    //epcc.languagedata = languageServiceListResolve[0];

    if ($stateParams.id) {
        epcc.action = 'edit';
        epcc.breadcrumb = 'SubMenu.EDIT_PEOPLE_COMMENT';
    } else {
        epcc.action = 'add';
        epcc.breadcrumb = 'SubMenu.PEOPLE_COMMENT_ADD';
    }

    PeoplecmdService.getSetting().then(function (response) {
        epcc.editsettingData = response[0].settings.site_url;
    })
    epcc.disbledValue = false;

    if ($stateParams.id) {
        epcc.submit = function submit(isValid, data) {
            if (isValid) {
                epcc.disbledValue = true;
                PeoplecmdService.savepeoplecmd(data).then(function (response) {
                    toastr.success('People Comments Added Successfully');
                    $state.go('app.peoplecomment.list', { page: $stateParams.page, items: $stateParams.items });
                }, function (err) {
                    toastr.error('Unable to process your request');
                });
            } else {
                toastr.error('Form Is Invalid');
            }
        };
    } else {
        if (PeoplecmdServiceResolve[1] >= 8) {
            toastr.error('Maximum Count for People Comments is 8. More People Comments Cannot be Added');
            $state.go('app.peoplecomment.list');
        } else {
            epcc.submit = function submit(isValid, data) {
                if (isValid) {
                    epcc.disbledValue = true;
                    PeoplecmdService.savepeoplecmd(data).then(function (response) {
                        toastr.success('People Comments Added Successfully');
                        $state.go('app.peoplecomment.list', { page: $stateParams.page, items: $stateParams.items });
                    }, function (err) {
                        toastr.error('Unable to process your request');
                    });
                } else {
                    toastr.error('Form Is Invalid');
                }
            };
        }
    }
    /* epcc.refresh = true;
    epcc.refreshChange = function (value) {
        if (value) {
            for (var i = 0; i < epcc.languagedata.length; i++) {
                epcc.editpeopletData.peopleDes[i].description = value;
                epcc.refresh = false;
            }            
        }
    }
    
    for (var i = 0; i < epcc.languagedata.length; i++) {
        var count = 0;
        for (var j = 0; j < epcc.editpeopletData.peopleDes.length; j++) {
            if (epcc.editpeopletData.peopleDes[j].lang_code == epcc.languagedata[i].code) {
                count++;
            }
        }
        if (count == 0) {
            var temp = {};
            temp.code = epcc.languagedata[i].code;
            temp.lang_name = epcc.languagedata[i].value;
            temp.description = "";
            epcc.editpeopletData.peopleDes.push(temp);
        }
    } */

}
