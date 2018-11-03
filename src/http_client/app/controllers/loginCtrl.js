(function() {
  "use strict";

  var loginCtrl = function($scope, $http, loginFactory, $location) {
    $scope.processing = false;

    $scope.info = {};

    $scope.login = function(info) {
      if (!info.login || !info.password) {
        return ($scope.loginForm.$error.requiredValues = true);
      } else {
        $scope.loginForm.$error.requiredValues = false;
      }
      $scope.processing = true;
      $http({
        method: "POST",
        url: loginFactory.loginUrl,
        data: info,
        headers: {
          "Content-type": "application/json"
        }
      }).then(
        function successCallback(response) {
          $scope.processing = false;
          loginFactory.setToken(response.data.data.token);
          $location.path("main");
        },
        function errorCallback(response) {
          $scope.processing = false;
          if (response.status === 401) {
            $scope.loginForm.$error.passwordError = true;
          } else {
            $scope.loginForm.$error.servidorError = true;
          }
        }
      );
    };
  };

  loginCtrl.$inject = ["$scope", "$http", "loginFactory", "$location"];

  angular.module("fmeApp").controller("loginCtrl", loginCtrl);
})();
