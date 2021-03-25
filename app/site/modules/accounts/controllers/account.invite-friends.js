angular.module('handyforall.accounts').controller('AccountInviteFriends', AccountInviteFriends);
AccountInviteFriends.$inject = ['$scope', '$rootScope', '$state', 'MainService', 'routes', '$window', '$translate'];

function AccountInviteFriends($scope, $rootScope, $state, MainService, routes, $window, $translate) {

    if (angular.isDefined($rootScope.settings) && angular.isDefined($rootScope.seoSettings) && angular.isDefined($rootScope.accountProfile) && angular.isDefined($rootScope.defaultCurrency)) {
        var seo = $rootScope.seoSettings;
        var settingsData = $rootScope.settings;
        var user = $rootScope.accountProfile;
        var defaultCurrency = $rootScope.defaultCurrency;
    }

    function facebookInviteFriends() {
        var invite = {};
        invite.name = $translate.instant("Signup with my code") + " "+ settingsData.site_title;
        invite.link = settingsData.site_url;
        invite.description = $translate.instant("Signup with my code") + " " + user.unique_code + " "+ $translate.instant("to earn") + " " + defaultCurrency.symbol + settingsData.referral.amount.referral + " "+ $translate.instant("on your") + " " + settingsData.site_title + " "+ $translate.instant("Wallet");
        invite.picture = settingsData.site_url + "uploads/default/facebook-share.jpg";
        FB.ui({ method: 'send', name: invite.name, link: invite.link, description: invite.description, picture: invite.picture });
    }

    function googleInviteFriends() {
        var subject = $translate.instant("Invitation for Registration");
        // var bodyText = `Refer and Earn, when your friend signup with your referral code, you earn  
        // ${settingsData.settings.referral.amount.referrer} in your wallet and your friend earn 
        // ${settingsData.settings.referral.amount.referral} A Signup using the code 
        // ${user.unique_code} and earn money in your wallet !Download: ${settingsData.settings.site_url}`;
        var bodyText = $translate.instant("Refer and Earn, when your friend signup with your referral code, you earn") + " " + settingsData.referral.amount.referrer + " "+ $translate.instant("in your wallet and your friend earn") + " " + settingsData.referral.amount.referral + " "+ $translate.instant("A Signup using the code") + " " + user.unique_code + " "+ $translate.instant("and earn money in your wallet !Download:") + " " + settingsData.site_url;
        $window.open("mailto:" + "?subject=" + subject + '&body=' + bodyText, "_blank");
    }

    angular.extend($scope, {
        facebookInviteFriends: facebookInviteFriends,
        googleInviteFriends: googleInviteFriends
    });
}