angular.module('handyforall.categories').controller('editCategoryCtrl', editCategoryCtrl);

editCategoryCtrl.$inject = ['categoryEditReslove', 'CategoryService', 'toastr', '$state', '$stateParams', 'Slug'];

function editCategoryCtrl(categoryEditReslove, CategoryService, toastr, $state, $stateParams, Slug) {
    var ecatc = this;

    ecatc.mainPagesList = categoryEditReslove[0];
    ecatc.editCategoryData = {};
    ecatc.editCategoryData.status = 1;

    if (categoryEditReslove[1]) {
        ecatc.editCategoryData = categoryEditReslove[1];
    }

    if ($stateParams.id) {
        ecatc.action = 'edit';
        ecatc.breadcrumb = 'SubMenu.EDIT_CATEGORY';
    } else {
        ecatc.action = 'add';
        ecatc.breadcrumb = 'SubMenu.ADD_CATEGORY';
    }

    ecatc.priority = categoryEditReslove[1].priority;
    
    if (ecatc.priority == 1) {
        ecatc.priority = true;
    } else {
        ecatc.priority = false;
    }

    ecatc.setPriority = function (value) {
        var data = {};
        data.priority = (value == false) ? 0 : 1;
        data.catid = categoryEditReslove[1]._id;
        CategoryService.updatePriority(data).then(function (response) {
            if(response == 'Limit Exceeds') {
                toastr.error('Sorry. Maximum 5 Categories Only Allowed');
                ecatc.priority = false;
            } else {
                ecatc.editCategoryData.priority = response.priority;
                toastr.success('Priority Updated Successfully');
            }
        });
    };

    CategoryService.getSetting().then(function (response) {
        ecatc.editsettingData = response[0].settings.site_url;
    })
    ecatc.disbledValue = false;
    ecatc.submit = function submit(isValid, data) {
        if (isValid) {
            ecatc.disbledValue = true;
            data.slug = Slug.slugify(data.slug);
            CategoryService.savecategory(data).then(function (response) {
                toastr.success('Category Added Successfully');
                $state.go('app.categories.list', { page: $stateParams.page, items: $stateParams.items });
            }, function (err) {
                toastr.error('Unable to process your request');
            });
        } else {
            toastr.error('form is invalid');
        }

    };

}
