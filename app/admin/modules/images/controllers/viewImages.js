angular.module('handyforall.images').controller('viewImagesCtrl', viewImagesCtrl);

viewImagesCtrl.$inject = ['ImagesServiceResolve', 'ImagesService', '$scope', 'toastr'];

function viewImagesCtrl(ImagesServiceResolve, ImagesService, $scope, toastr) {

    var tlc = this;
    tlc.data = ImagesServiceResolve[0];
console.log(tlc.data)
    tlc.images = {};
    for (var i = 0; i < tlc.data.length; i++) {
        if (tlc.data[i].imagefor == 'taskersignup') {
            tlc.images.taskersignup = tlc.data[i].image;
        }
        if (tlc.data[i].imagefor == 'backgroundimage') {
            tlc.images.backgroundimage = tlc.data[i].image;
        }
        if (tlc.data[i].imagefor == 'adminlogin') {
            tlc.images.adminlogin = tlc.data[i].image;
        }
        if (tlc.data[i].imagefor == 'loginpage') {
            tlc.images.loginpage = tlc.data[i].image;
        }
        if (tlc.data[i].imagefor == 'taskerprofile') {
            tlc.images.taskerprofile = tlc.data[i].image;
        }
        if (tlc.data[i].imagefor == 'bannerpage') {
            tlc.images.bannerpage = tlc.data[i].image;
            tlc.bgoption = tlc.data[i].background_option;
            tlc.images.banner_video = tlc.data[i].video;
        }

    }

    if (tlc.bgoption == 2) {
        tlc.bgoption = true;
    } else {
        tlc.bgoption = false;
    }

    tlc.bgoptionChange = function (value) {
        if (value == false) {
            tlc.images.bgoption = 1;
        } else {
            tlc.images.bgoption = 2;
        }
    }

    tlc.submit = function submit(isValid, header, branding, sidebar, active, fixedheader, fixedaside) {
        if (isValid) {
            tlc.images.header = header;
            tlc.images.branding = branding;
            tlc.images.sidebar = sidebar;
            tlc.images.active = active;
            tlc.images.fixedheader = fixedheader;
            tlc.images.fixedaside = fixedaside;
            console.log(tlc.images);
            ImagesService.save(tlc.images).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Appearance Settings Not Added Successfully');
                } else {
                    toastr.success('Appearance Settings Updated Successfully');
                }
            }, function (err) {
             //   console.log(err);
                toastr.error('Your credentials are gone');
            });
        } else {
            toastr.error('form is invalid');

        }
    };

    tlc.test = function test(value) {
        if (value == true) {
            $scope.main.settings.headerFixed = true;
        } else {
            $scope.main.settings.headerFixed = false;
        }
    };


    tlc.fixedHeaderChange = function fixedHeaderChange(value) {
        if (value == true || value == false) {
            var data = {};
            data.checkedvalue = value;
            ImagesService.fixedHeaderSave(data).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Fixed header Not Added Successfully');
                } else {
                    toastr.success('Fixed header Updated Successfully');
                }
            }, function (err) {
                toastr.error('Your credentials are gone');
            });
        }
    };

    tlc.fixedasideChange = function fixedasideChange(value) {
        if (value == true || value == false) {
            var data = {};
            data.checkedvalue = value;
            ImagesService.fixedAsideSave(data).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Fixed aside Not Added Successfully');
                } else {
                    toastr.success('Fixed aside Updated Successfully');
                }
            }, function (err) {
                toastr.error('Your credentials are gone');
            });
        }
    };
}
