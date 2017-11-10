(function (app) {
    'use strict';
    app.controller('LoginController', ['$scope', '$http', function ($scope, $http) {
        $scope.title = 'Login';
		$scope.user_name = '';
		$scope.password = '';
		$scope.failed_message = '';


		$scope.do_login = function() {
			if ($scope.user_name === '' || $scope.password === '') {
				return;
			}
			$http({
            	url: '/api/login',
            	method: "POST",
            	data: {
					'user': $scope.user_name,
					'password': $scope.password,
				},
			})
				.success(function (data, status, headers, config) {
					if (data.error) {
						$scope.failed_message = data.message;
					} else {
						//set session
						window.location.href="../home";
					}
				})
				.error(function (data, status, headers, config) {
					$scope.failed_message = 'Login failed, please check your network.';
				});
		};
		$scope.register = function () {
			window.location.href="/register";
		};
    }]);
})(angular.module('am_server'));
