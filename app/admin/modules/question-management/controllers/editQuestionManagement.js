angular.module('handyforall.question').controller('editQuestionerCtrl', editQuestionerCtrl);

editQuestionerCtrl.$inject = ['QuestionEditReslove', 'QuestionService', 'toastr', '$state', '$stateParams', 'languageService', 'languageServiceListResolve'];

function editQuestionerCtrl(QuestionEditReslove, QuestionService, toastr, $state, $stateParams, languageService, languageServiceListResolve) {
    var edqc = this;
    edqc.editQuestionData = QuestionEditReslove[0];
    edqc.languagedata = languageServiceListResolve[0];

    if ($stateParams.id) {
        edqc.action = 'edit';
        edqc.breadcrumb = 'SubMenu.EDIT_QUESTION';
        edqc.tempQues = QuestionEditReslove[0].question;
    } else {
        edqc.action = 'add';
        edqc.breadcrumb = 'SubMenu.ADD_QUESTION';
    }

    edqc.submit = function submit(isValid) {
        if (isValid) {

            QuestionService.save(edqc.editQuestionData).then(function (response) {
                toastr.success('Question Added Successfully');
                $state.go('app.tasker_management.question.viewsQuestion');
                var filedata = [];
                if (edqc.editQuestionData.question && edqc.languagedata && edqc.languagedata.length > 0 && edqc.tempQues != edqc.editQuestionData.question) {
                    edqc.languagedata.map(function (value, i) {
                        var temp = {};
                        temp.key = edqc.editQuestionData.question;
                        temp.code = value.code;
                        temp.value = edqc.editQuestionData.question;
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
