(function (app) {
    'use strict';
    app.controller('RegisterController', ['$scope', '$http', function ($scope, $http) {
        $scope.title = 'Register';
		$scope.user_name = '';
		$scope.password = '';
		$scope.retype = '';
		$scope.failed_message = '';
		$scope.RE = /^[a-zA-Z0-9_/-]*$/;
		$scope.register_success = false;

		$scope.do_register = function() {

			if ($scope.password !== $scope.retype) {
				$scope.failed_message = '两次输入的密码不相同!';
				return;
			}

			$http({
            	url: '/api/register',
            	method: "POST",
            	data: {
					'user': $scope.user_name,
					'password': $scope.password,
					'email': $scope.email,
				},
			})
				.success(function (data, status, headers, config) {
					if (data.error) {
						$scope.failed_message = data.message;
					} else {
						$scope.register_success = true;
					}
				})
				.error(function (data, status, headers, config) {
					$scope.failed_message = 'Add user failed, please check your network.';
				});
		};

    }]);
})(angular.module('am_server'));
