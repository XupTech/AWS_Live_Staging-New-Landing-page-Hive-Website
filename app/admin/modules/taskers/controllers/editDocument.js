angular.module('handyforall.taskers').controller('editDocumentCtrl', editDocumentCtrl);

editDocumentCtrl.$inject = ['documentEditReslove', 'TaskersService', 'toastr', '$state', '$stateParams', '$scope'];

function editDocumentCtrl(documentEditReslove, TaskersService, toastr, $state, $stateParams, $scope) {
    var edoc = this;

    if ($stateParams.id) {
        edoc.editdocumentData = documentEditReslove;

        console.log('documentEditReslove', documentEditReslove)

        angular.forEach(edoc.editdocumentData, function (docs) {
            angular.forEach(docs, function (filetype) {
                filetype.selected = filetype.selected == 1 ? true : false;
            });
        });

        edoc.file_types = edoc.editdocumentData.file_types;
        edoc.action = 'edit';

        edoc.breadcrumb = 'SubMenu.EDIT_DOCUMENT';
    } else {
        edoc.file_types = [
            { name: 'jpg', ftype: 'image/jpg', selected: false},
            { name: 'jpeg', ftype: 'image/jpeg', selected: false}, 
            { name: 'png', ftype: 'image/png', selected: false}, 
            { name: 'pdf', ftype: 'application/pdf', selected: false}, 
            { name: 'doc', ftype: '.doc', selected: false}, 
            { name: 'docx', ftype: '.docx', selected: false}
        ];

        edoc.action = 'add';
        edoc.breadcrumb = 'SubMenu.DOCUMENT_ADD';
    }

    // Toggle selection for a given fruit by name
    edoc.addFileTypes = function addFileTypes(type) {
        angular.forEach(edoc.file_types, function (docs) {
            if(docs.name == type.name) {
                docs = type;
            }
        });
    };

    edoc.submit = function submit(isValid, data) {
        if (isValid) {
            TaskersService.editDocumentCall(data).then(function (response) {
                toastr.success('Document Added Successfully');
                $state.go('app.taskers.documentslist', { page: $stateParams.page, items: $stateParams.items });
            }, function (err) {
                toastr.error(err.data.msg);
            });
        } else {
            toastr.error('form is invalid');
        }

    };

}
