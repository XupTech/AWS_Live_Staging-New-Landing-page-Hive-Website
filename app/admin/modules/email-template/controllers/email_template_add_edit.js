angular.module('handyforall.emailTemplate').controller('emailTemplateSaveCtrl', emailTemplateSaveCtrl);

emailTemplateSaveCtrl.$inject = ['emailTemplateEditResolve', 'toastr', 'EmailTemplateService', '$state', '$stateParams', 'PageService', 'PageTranslateServiceResolve', 'emailTemplateListResolve', 'languageServiceListResolve','languageService'];

function emailTemplateSaveCtrl(emailTemplateEditResolve, toastr, EmailTemplateService, $state, $stateParams, PageService, PageTranslateServiceResolve, emailTemplateListResolve, languageServiceListResolve, languageService) {
  var eetc = this;
  eetc.templateData = emailTemplateEditResolve[0] || {};
  eetc.templateData.dispatch_mail = true;
  eetc.languagedata = PageTranslateServiceResolve.languagedata;
  eetc.newlanguagedata = languageServiceListResolve[0];
  eetc.emailTemplateList = emailTemplateListResolve[0];

  if (eetc.templateData) {
    if (!eetc.templateData.dispatch_mail) {
      eetc.templateData.dispatch_mail = false;
    }
  }
  if ($stateParams.action == "addtrans") {
    eetc.addPage = true;
    if ($stateParams.lang) {
      eetc.templateData.lang = $stateParams.lang;
    }
    if ($stateParams.name) {
      eetc.templateData.name = $stateParams.name;
    }
  }else{
    eetc.addPage = false;
  }

  // console.log('<---------------->', eetc.templateData.dispatch_mail)

  if (eetc.templateData) {
    if (eetc.templateData.subscription == 1) {
      eetc.templateData.subscription = true;
    } else {
      eetc.templateData.subscription = false;
    }
  }
  eetc.checked = false;
  if ($stateParams.id) {
    eetc.checked = true;
    eetc.action = 'edit';
    eetc.breadcrumb = 'SubMenu.EMAILTEMPLATE_EDIT';
  } else {
    eetc.action = 'add';
    eetc.breadcrumb = 'SubMenu.EMAILTEMPLATE_ADD';
  }

  eetc.selectTemplate = function selectTemplate(template) {
    eetc.email_content =  eetc.emailTemplateList.filter(function(email_template) {
      if (email_template.name == template && email_template.lang == 'en') {
        return email_template;
      }else{
        return "";
      }
    });
    if (eetc.email_content[0]) {
      eetc.templateData.email_content = eetc.email_content[0].email_content
    }
  }

  eetc.selectLanguage = function selectLanguage(lang, templateName) {
    EmailTemplateService.getTemplateByName({name: templateName, lang: lang}).then(function (response) {
      if (response.status == "1") {
        eetc.templateData = response.response;
        if (eetc.templateData.dispatch_mail == 1) {
          eetc.templateData.dispatch_mail = true;
        }
        if (eetc.templateData.subscription == 1) {
          eetc.templateData.subscription = true;
        }
      } else {
        eetc.templateData._id = null;
        toastr.warning('Template not exist in this language, Please add content for this language and submit');
        //$state.go('app.emailtemplate.action', {action: "addtrans", lang: lang, name: templateName, id: undefined, page: undefined, items: undefined});
      }
    })
  }

  eetc.submitTemplateEditData = function submitTemplateEditData(isValid, data) {
    if (isValid) {
      // console.log(data)
      if (!data.dispatch_mail) {
        data.dispatch_mail = false;
      }

      if (data.subscription == true || data.subscription == 1) {
        data.subscription = 1;
      } else {
        data.subscription = 0;
      }
      data.lang = data.lang ? data.lang : 'en'
      console.log("data",data);
      EmailTemplateService.editTemplate(data).then(function (response) {
        if (response.status && response.status == "422") {
          toastr.error('Template Already Exist For this language');
        }else{
          if (eetc.action == 'edit') {
            var action = "edited";
          } else {
            var action = "added";
            $state.go('app.emailtemplate.list', { page: $stateParams.page, items: $stateParams.items});
          }
          toastr.success('Template ' + action + ' successfully');
        }
      }, function (error) {
        toastr.error('Unable to process your request');
      });
    }
  };

}
