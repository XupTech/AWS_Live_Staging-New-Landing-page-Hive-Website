angular.module('handyforall.category')
	.controller('carddetailCtrl', carddetailCtrl);

carddetailCtrl.$inject = ['$scope', '$rootScope', '$window', '$stateParams', '$state', 'CarddetailResolve', 'CarddetailService', 'MainService', 'CurrentUserResolve', '$translate', '$location', '$anchorScroll', 'toastr'];
function carddetailCtrl($scope, $rootScope, $window, $stateParams, $state, CarddetailResolve, CarddetailService, MainService, CurrentUserResolve, $translate, $location, $anchorScroll, toastr) {

	var cdc = this;
	cdc.data = CarddetailResolve.taskdata[0];
	cdc.currentUser = CurrentUserResolve[0];
	$scope.doPayment = true;
	if (cdc.data.status == 7 && cdc.data.invoice.status == 1) {
		cdc.paymentStatus = 'Completed';
	}

	CarddetailService.paymentmode().then(function (response) {
		cdc.paymentmode = response;
	});

	cdc.balance_amount = cdc.data.invoice.amount.balance_amount;
	cdc.service_tax = cdc.data.invoice.amount.service_tax;

	if (cdc.data.invoice.amount.coupon) {
		cdc.couponbtn = 0;
		cdc.coupon = cdc.data.invoice.coupon;
	}
	else {
		console.log('elsees');
		cdc.coupon = '';
		cdc.couponbtn = 1;
	}
	//cdc.couponAmount ='';
	cdc.couponVisible = false;
	cdc.applyCoupon = function payment(coupon) {
		if (coupon == undefined || coupon == '') {
			$translate('ENTER COUPON CODE').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
		} else {
			var data = {};
			data.coupon = coupon;
			data.task = CarddetailResolve.taskdata[0]._id;
			data.user = CurrentUserResolve[0]._id;
			CarddetailService.applyCoupon(data).then(function (response) {
				if (response.length > 0) {
					if (response[0].status == 7) {
						$state.go('account.profile');
						$translate('PAYMENT COMPLETED').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
					}
					else {
						cdc.couponVisible = true;
						cdc.couponAmount = response[0].invoice.amount.coupon;
						cdc.couponbtn = 0;
						cdc.data.invoice = response[0].invoice;
						//var extra_amount = response[0].invoice.amount.extra_amount || 0;
						cdc.grandtotal = response[0].invoice.amount.grand_total;
						if (response[0].invoice.amount.coupon != 0) {
							cdc.grandtotal = response[0].invoice.amount.grand_total - response[0].invoice.amount.coupon;
						}
						cdc.balance_amount = response[0].invoice.amount.balance_amount;
						cdc.service_tax = response[0].invoice.amount.service_tax;
						$translate('SAVED SUCCESSFULLY').then(function (headline) {
							toastr.success(headline);
						}, function (headline) {
							toastr.success(headline);
						});
					}
				} else {
					$translate(response.message).then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
				}
			}, function (err) {
				$scope.addAlert('danger', err.message);
			});
		}
	};


	cdc.removeCoupon = function payment(coupon) {
		if (coupon == undefined) {
			$translate('ENTER VALID COUPON CODE').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
		} else {
			var data = {};
			data.coupon = coupon;
			data.task = CarddetailResolve.taskdata[0]._id;
			data.user = CurrentUserResolve[0]._id;
			CarddetailService.removeCoupon(data).then(function (response) {
				cdc.couponVisible = false;
				cdc.couponbtn = 1;
				cdc.grandtotal = response[0].invoice.amount.grand_total;
				cdc.balance_amount = response[0].invoice.amount.balance_amount;
				cdc.coupon = '';
				cdc.data = CarddetailResolve.taskdata[0];
				cdc.data.invoice.amount.grand_total = response[0].invoice.amount.grand_total;
				cdc.data.invoice.amount.balance_amount = response[0].invoice.amount.balance_amount;
				cdc.data.invoice.amount.coupon = 0;
				$translate('SAVED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
			}, function (err) {
				$scope.addAlert('danger', err.message);
			});
		}
	};

	cdc.walletpayment = function walletpayment(data, coupon) {
		var walletdata = {};
		if (cdc.balance_amount) {
			walletdata.amount = cdc.balance_amount;
		} else {
			walletdata.amount = data.invoice.amount.balance_amount;
		}
		walletdata.taskid = data._id;
		walletdata.taskerid = data.tasker._id;
		walletdata.userid = data.user._id;
		walletdata.createdat = data.createdAt;
		$scope.doPayment = false;
		CarddetailService.walletpayment(walletdata).then(function (response) {
			cdc.data = response;
			$scope.doPayment = true;
			if (cdc.data.payment_type == "wallet-other" && cdc.data.status != 7) {
				cdc.couponbtn = 1;
				cdc.paymentStatus = 'Wallet money over';
				cdc.balance_amount = cdc.data.invoice.amount.balance_amount;
			} else if (cdc.data.status == 0) {
				$translate('RECHARGE YOUR WALLET').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
				cdc.data = CarddetailResolve.taskdata[0];
			} else {
				cdc.paymentStatus = 'completed';
				$state.go('account.profile', {}, { reload: true });
				$translate('PAYMENT COMPLETED').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
				CarddetailResolve.taskdata[0]._id;
			}
		}, function (err) {
			$scope.doPayment = true;
			if (err.message) {
				$scope.addAlert('danger', err.message);
			} else {
				$translate('RECHARGE YOUR WALLET').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
			}
		});
	};

	cdc.creditscroll = function creditscroll() {
		$location.hash('dopaymentcredit');
		$anchorScroll();
		$location.url($location.path());
	}
	cdc.payment = function payment(isValid) {
		if (isValid) {
			cdc.formdata = cdc.taskPayment;
			cdc.formdata.taskid = CarddetailResolve.taskdata[0]._id;
			$scope.doPayment = false;
			CarddetailService.confirmtask(cdc.formdata).then(function (response) {
				$scope.doPayment = true;
				if (response.status == 1) {
					$state.go('account.profile');
					$translate('PAYMENT COMPLETED').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
					cdc.paymentStatus = 'completed';
				} else if (response.status == 0) {
					$translate(response.raw.message).then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
				}
			}, function (err) {
				$scope.doPayment = true;
				if (err.data.message) {
					$translate(err.data.message).then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
				} else {
					$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
				}
			});
		} else {
			$translate('PLEASE ENTER THE VALID DATA').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
		}
	};


	cdc.couponCompltePayment = function couponCompltePayment(data) {
		var couponCompletedata = {};
		couponCompletedata.amount = data.invoice.amount.balance_amount;
		couponCompletedata.taskid = data._id;
		couponCompletedata.taskerid = data.tasker._id;
		couponCompletedata.userid = data.user._id;
		couponCompletedata.createdat = data.createdAt;
		CarddetailService.couponCompletePayment(couponCompletedata).then(function (response) {
			if (response) {
				cdc.data = response;
			}
			cdc.paymentStatus = 'completed';
			$state.go('account.profile');
			$translate('PAYMENT COMPLETED').then(function (headline) { toastr.success(headline); }, function (headline) { toastr.success(headline); });
			CarddetailResolve.taskdata[0]._id;

		}, function (err) {
			if (err.message) {
				$scope.addAlert('danger', err.message);
			} else {
				$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
				//$scope.addAlert('danger', 'Unable Process Your Payment');
			}
		});
	};


	cdc.paypalPayment = function paypalPayment(data) {
		var paymentdetails = {};
		paymentdetails.task = data._id;
		paymentdetails.user = data.user._id;
		$scope.doPayment = false;
		CarddetailService.paypalPayment(paymentdetails).then(function (response) {
			if (response.status == 1 && response.payment_mode == 'paypal') {
				$window.location.href = response.redirectUrl;
				//$scope.doPayment = true;
			} else {
				$scope.doPayment = true;
				$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
			}
		}, function (err) {
			$scope.doPayment = true;
			if (err.message) {
				$scope.addAlert('danger', err.message);
			} else {
				$translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (headline) { toastr.error(headline); });
			}
		});
	};

	cdc.payemntvalue = function payemntvalue(payemnt) {
		cdc.type = payemnt;
	}

}
