(function (app) {
    'use strict';
    app.controller('ResetPasswordController', ['$scope', '$location', '$http', 'Util', function ($scope, $location, $http, Util) {
        $scope.name = $location.search().user;
        $scope.req_id = $location.search().id;
        $scope.timestamp = $location.search().timestamp;
        $scope.password = "";
        $scope.password = "";
        $scope.failed_message = "";
        $scope.pw_matched = true;
        $http({
            url: '/api/user/reset_pw_req',
            method: "POST",
            data: {
                'user': $scope.name,
                'req_id': $scope.req_id,
            },
        })
            .success(function (data, status, headers, config) {
                if (data.error) {
                    $scope.failed_message = data.message;
                } else {
                    $scope.show_reset_form = true;
                }
            })
            .error(function (data, status, headers, config) {
                $scope.failed_message = '连接服务器失败,请检查网络后重试！';
            });

        $scope.pw_changed = function () {
            $scope.pw_matched = ($scope.password === $scope.password_retype);
        };
        $scope.reset = function () {
            if ($scope.password && $scope.pw_matched) {
                $http({
                    url: '/api/user/reset_pw',
                    method: "POST",
                    data: {
                        'user': $scope.name,
                        'req_id': $scope.req_id,
                        'password': Util.encrypt($scope.password),
                    },
                })
                    .success(function (data, status, headers, config) {
                        if (data.error) {
                            $scope.show_reset_form = false;
                            $scope.failed_message = data.message;
                        } else {
                            $scope.show_reset_form = false;
                            $scope.failed_message = "修改成功！";
                        }
                    })
                    .error(function (data, status, headers, config) {
                        $scope.failed_message = '连接服务器失败,请检查网络后重试！';
                    });
            }
        }

    }]);
})(angular.module('am_server'));
