(function (app) {
    'use strict';
    app.controller('MainIndexController', ['$scope', 'SessionStorage', function ($scope, SessionStorage) {
        $scope.title = 'Main';
        $scope.showName = function () {
            alert(SessionStorage.get('user'));
        };
    }]);
})(angular.module('am_server'));
