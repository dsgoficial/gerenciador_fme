(function() {
  "use strict";

  var mainCtrl = function($scope, dataFactory) {
    $scope.abaAtiva = "executar";
  };

  mainCtrl.$inject = ["$scope", "dataFactory"];

  angular.module("fmeApp").controller("mainCtrl", mainCtrl);
})();
