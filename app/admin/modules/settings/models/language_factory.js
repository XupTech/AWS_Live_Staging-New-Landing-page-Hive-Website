var app = angular.module('handyforall.languages');
app.factory('languageService', languageService);
languageService.$inject = ['$http', '$q'];
function languageService($http, $q) {
    var languageService = {
        getLanguageList: getLanguageList,
        getLanguage: getLanguage,
        editlanguage: editlanguage,
        managelanguage: managelanguage,
        mobilelanguage: mobilelanguage,
        submitlanguageDataCall: submitlanguageDataCall,
        selectDefault: selectDefault,
        getDefault: getDefault,
        AddLanguageCode: AddLanguageCode,
        DownloadLanguageCode : DownloadLanguageCode,
        submitmobilelanguageDataCall: submitmobilelanguageDataCall,
        deletemobilelanguage : deletemobilelanguage,
        deletelanguage : deletelanguage,
        multideletemobilelanguage : multideletemobilelanguage,
        multideletelanguage : multideletelanguage,
        languageWrite : languageWrite
    };
    return languageService;

    function getLanguageList(limit, skip, sort, search) {
        var deferred = $q.defer();
        var data = {};
        data.sort = sort;
        data.search = search;
        data.limit = limit;
        data.skip = skip;

        $http({
            method: 'POST',
            url: '/settings/language/list',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getLanguage(id) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/language/getlanguage/' + id
        }).success(function (data) {

            deferred.resolve([data, data.length]);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function editlanguage(value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/edit',
            data: value
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function AddLanguageCode(value, type) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/add',
            data: { language: value, type: type }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function languageWrite(value) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/languageWrite',
            data: { language: value }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function DownloadLanguageCode(value, type) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/download',
            data: { code: value, type: type }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function managelanguage(value, current, limit, search) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/manage',
            data: { 'code': value, 'current': current, 'limit': limit, 'search': search }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deletelanguage(language, del) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/deletecontent',
            data: { 'language': language, 'del': del }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function deletemobilelanguage(language, del, type) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/deletecontent',
            data: { 'language': language, 'del': del, 'type': type }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function mobilelanguage(value, current, limit, search, type) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/mobile',
            data: { 'code': value, 'current': current, 'limit': limit, 'search': search, 'type': type }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function multideletelanguage(language, del) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/multideletecontent',
            data: { 'language': language, 'del': del }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function multideletemobilelanguage(language, del) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/multideletecontent',
            data: { 'language': language, 'del': del }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    /*function mobilelanguage(value, current, limit, search) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/mobile',
            data: { 'code': value, 'current': current, 'limit': limit, 'search': search }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }*/


    function submitlanguageDataCall(id, data) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/translation/save',
            data: { id: id, data: data }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function submitmobilelanguageDataCall(id, data, type) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/settings/language/mobiletranslation/save',
            data: { id: id, data: data, type: type }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    function selectDefault(id) {
        var data = { id: id };
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/settings/language/default/save',
            data: data
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function getDefault() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/settings/language/default'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


}
