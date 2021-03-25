angular.module('handyforall.experience').controller('editExperienceCtrl', editExperienceCtrl);

editExperienceCtrl.$inject = ['ExperienceService', 'toastr', 'ExperienceEditReslove', '$state', '$stateParams', 'languageService', 'languageServiceListResolve'];
function editExperienceCtrl(ExperienceService, toastr, ExperienceEditReslove, $state, $stateParams, languageService, languageServiceListResolve) {
    var eec = this;
    eec.editExperienceData = ExperienceEditReslove;
    eec.languagedata = languageServiceListResolve[0];
    /*,ExperienceEditReslove*/
    if ($stateParams.id) {
        eec.action = 'edit';
        eec.breadcrumb = 'SubMenu.EDIT_EXPERIENCE';
        eec.tempQues = ExperienceEditReslove.name;
    } else {
        eec.action = 'add';
        eec.breadcrumb = 'SubMenu.ADD_EXPERIENCE';
    }
    eec.submit = function submit(isValid) {
        if (isValid) {
            ExperienceService.save(eec.editExperienceData).then(function (response) {
                if (eec.action == 'edit') {
                    var action = "edited";
                } else {
                    var action = "added";
                }
                toastr.success('Experience ' + action + ' Successfully');
                $state.go('app.tasker_management.experience.list');
                var filedata = [];
                if (eec.editExperienceData.name && eec.languagedata && eec.languagedata.length > 0 && eec.tempQues != eec.editExperienceData.name) {
                    eec.languagedata.map(function (value, i) {
                        var temp = {};
                        temp.key = eec.editExperienceData.name;
                        temp.code = value.code;
                        temp.value = eec.editExperienceData.name;
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


}
