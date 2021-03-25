angular.module('handyforall.languages').controller('languageSettingsManageCtrl', languageSettingsManageCtrl);
languageSettingsManageCtrl.$inject = ['languageServiceListResolve', 'languageServiceManageResolve', 'content', 'toastr', 'languageService', '$state', '$stateParams', '$modal'];

function languageSettingsManageCtrl(languageServiceListResolve, languageServiceManageResolve, content, toastr, languageService, $state, $stateParams, $modal) {

	var lsmc = this;
	lsmc.translationKey = languageServiceManageResolve.data;
    lsmc.translationValue = languageServiceManageResolve.data;
    console.log(languageServiceManageResolve.data,"languageServiceManageResolve.data",languageServiceManageResolve.data)
	lsmc.languages = languageServiceListResolve;
	lsmc.purpose = content.purpose;
	lsmc.code = content.code;
	lsmc.currentPage = 1;
	lsmc.entryLimit = 10;
	lsmc.pageSizes = [5, 10, 50, 100];
	lsmc.maxPaginationSize = 3;
	lsmc.selectAction = "";
	lsmc.data = {}
	lsmc.data.count = languageServiceManageResolve.total;

	lsmc.search = "";

	lsmc.type = 'mobile';

	lsmc.translationArr = Object.keys(lsmc.translationValue);
	lsmc.translationCheck = lsmc.translationArr.map(function (key) {
		return {
			selected: false,
			key: key
		}
	});

	lsmc.searchContent = function searchContent(search, type) {
		if (lsmc.purpose == "Mobile") {
			lsmc.type = type;
			languageService.mobilelanguage(lsmc.code, lsmc.currentPage, lsmc.entryLimit, search, type).then(function (response) {
				lsmc.translationKey = response.data;
				lsmc.translationValue = response.data;
				lsmc.data = {}
				lsmc.data.count = response.total;
			}, function (err) {
				toastr.error('Unable to get your data');
			});
		} else {
			languageService.managelanguage(lsmc.code, lsmc.currentPage, lsmc.entryLimit, search).then(function (response) {
				lsmc.translationKey = response.data;
				lsmc.translationValue = response.data;
				lsmc.data = {}
				lsmc.data.count = response.total;
			}, function (err) {
				toastr.error('Unable to get your data');
			});
		}
	}

	lsmc.deleteMultiple = function deleteMultiple() {
		if (lsmc.selectAction == "delete") {
			var del = lsmc.translationCheck.filter(function (dele) {
				return dele.selected == true;
			})
			console.log("Delete",del);
			if (del && del.length > 0) {
				var lang = [];
				lsmc.languages[0].map(function (value) {
					var temp = {};
					temp.code = lsmc.purpose == "Mobile" ? `${value.code}_mob` : value.code;
					lang.push(temp);
				})
				if (lsmc.purpose == "Mobile") {
					languageService.multideletemobilelanguage(lang, del).then(function (response) {
						console.log("​Del Response", response);
						if (response && response.status == 1) {
							toastr.success("Language Content Deleted Successfully");
							lsmc.pageChange(lsmc.currentPage, lsmc.entryLimit)
						} else {
							toastr.error('Unable to delete your data');
						}
					}, function (err) {
						toastr.error('Unable to delete your data');
					});
				} else {
					languageService.multideletelanguage(lang, del).then(function (response) {
						console.log("Del Response", response);
						if (response && response.status == 1) {
							toastr.success("Language Content Deleted Successfully");
							lsmc.pageChange(lsmc.currentPage, lsmc.entryLimit)
						} else {
							toastr.error('Unable to delete your data');
						}
					}, function (err) {
						toastr.error('Unable to delete your data');
					});
				}
			} else {
				toastr.error("Nothing to Delete");
			}
		} else {
			toastr.error("Select any Option to Apply");
		}
	}

	lsmc.checkcalc = function checkcalc(value) {
		lsmc.translationArr = Object.keys(value);
		lsmc.translationCheck = lsmc.translationArr.map(function (key) {
			return {
				selected: false,
				key: key
			}
		});
	}

	lsmc.pageChange = function pageChange(current, limit) {
		if (lsmc.purpose == "Mobile") {
			languageService.mobilelanguage(lsmc.code, current, limit, "").then(function (response) {
				lsmc.translationKey = response.data;
				lsmc.translationValue = response.data;
				lsmc.checkcalc(lsmc.translationValue);
			}, function (err) {
				toastr.error('Unable to get your data');
			});
		} else {
			languageService.managelanguage(lsmc.code, current, limit, "").then(function (response) {
				lsmc.translationKey = response.data;
				lsmc.translationValue = response.data;
				lsmc.checkcalc(lsmc.translationValue);
			}, function (err) {
				toastr.error('Unable to get your data');
			});
		}
	}

	lsmc.downloadlanguageData = function addlanguageData() {
		languageService.DownloadLanguageCode(lsmc.code, lsmc.type).then(function (response) {
			if (response && response.status == 1) {
				var downloadLink = angular.element('<a></a>');
				downloadLink.attr('href', response.response);
				downloadLink.attr('target', '_self');
				downloadLink.attr('download', 'MobileLanguage.xml');
				downloadLink[0].click();
				toastr.success('Language Content Downloaded Successfully');
			} else {
				toastr.error('Unable to Download Language Content');
			}
		});
	}

	lsmc.deleteContent = function deleteContent(del) {
		console.log("Delete", del);
		var lang = [];
		console.log(lsmc.languages)
		lsmc.languages[0].map(function (value) {
			var temp = {};
			temp.code = lsmc.purpose == "Mobile" && lsmc.type == 'mobile' ? value.code : `${value.code}_mob`;
			lang.push(temp);
		})
		if (lsmc.purpose == "Mobile") {
			languageService.deletemobilelanguage(lang, del, lsmc.type).then(function (response) {
				console.log("​Del Response", response);
				if (response && response.status == 1) {
					toastr.success('Data deleted Successfully');
					lsmc.pageChange(lsmc.currentPage, lsmc.entryLimit)
				} else {
					toastr.error('Unable to delete your data');
				}
			}, function (err) {
				toastr.error('Unable to delete your data');
			});
		} else {
			languageService.deletelanguage(lang, del).then(function (response) {
				console.log("Del Response", response);
				if (response && response.status == 1) {
					toastr.success('Data deleted Successfully');
					lsmc.pageChange(lsmc.currentPage, lsmc.entryLimit)
				} else {
					toastr.error('Unable to delete your data');
				}
			}, function (err) {
				toastr.error('Unable to delete your data');
			});
		}
	}

	lsmc.addlanguageData = function addlanguageData() {
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'app/admin/modules/settings/views/language/add_language_code_model.html',
			controller: 'AddLanguageCode',
			controllerAs: 'ALC',
			resolve: {
				languages: function () {
					if (lsmc.languages && lsmc.languages.length > 0) {
						return lsmc.languages[0];
					}
				}
			}
		});
		var filedata = [];
		modalInstance.result.then(function (data) {
			if (data.languagekey && data.finallanguage && data.finallanguage.length > 0) {
				data.finallanguage.map(function (value, i) {
					var temp = {};
					temp.key = data.languagekey;
					temp.code = lsmc.purpose == "Mobile" && lsmc.type == 'mobile' ? value.code : `${value.code}_mob`;
					temp.value = value.value;
					filedata.push(temp);
				})
			}
			if (filedata.length > 0) {
				languageService.AddLanguageCode(filedata, lsmc.type).then(function (response) {
					if (response && response.status == 1) {
						toastr.success('Language Content Added Successfully');
					} else {
						toastr.error('Unable to Add Language Content');
					}
				});
			}
		});
	}

	lsmc.submitlanguageData = function submitlanguageData() {
		if (lsmc.purpose == "Mobile") {
			languageService.submitmobilelanguageDataCall(lsmc.code, lsmc.translationValue, lsmc.type).then(function (response) {
				toastr.success('Language Submitted Successfully');
				$state.go('app.settings.languageSettings.list', {}, { reload: true });
			}, function (err) {
				toastr.error('Unable to save your data');
			});
		} else {
			languageService.submitlanguageDataCall(lsmc.code, lsmc.translationValue).then(function (response) {
				toastr.success('Language Submitted Successfully');
				$state.go('app.settings.languageSettings.list', {}, { reload: true });
			}, function (err) {
				toastr.error('Unable to save your data');
			});
		}
	}

}

angular.module('handyforall.languages').controller('AddLanguageCode', function ($modalInstance, languages, toastr) {
	var alc = this;
	alc.languages = languages;
	alc.languagekey = "";
	alc.finallanguage = [];
	alc.refresh = true;
	alc.refreshChange = function (value) {
		console.log("value",value)
		if (value) {
			var temparr = [];
			for (var i = 0; i < alc.languages.length; i++) {
				var temp = {};
				temp.code = alc.languages[i].code;
				temp.value = value;
				temparr.push(temp);
			}
			alc.finallanguage = temparr;
			alc.refresh = false;
		}
	}
	for (var i = 0; i < alc.languages.length; i++) {
		var temp = {};
		temp.code = alc.languages[i].code;
		temp.value = "";
		alc.finallanguage.push(temp);
	}
	alc.ok = function (valid) {
		if (valid == true) {
			$modalInstance.close(alc);
		} else {
			toastr.error('Invalid Form')
		}
	};
	alc.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});