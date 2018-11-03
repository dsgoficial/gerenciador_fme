(function() {
  "use strict";

  var atualizarCtrl = function($scope, $window, $route, dataFactory) {
    //inicializa as tabelas
    $scope.workspace = [];
    $scope.usuarios = [];
    $scope.reload = function() {
      dataFactory.getTabelas().then(
        function success(response) {
          $scope.workspaces = dataFactory.tabelas;
        },
        function error(response) {}
      );
      dataFactory.getUsuarios().then(
        function success(response) {
          $scope.usuarios = response;
        },
        function error(response) {}
      );
    };
    $scope.reload();

    //config para calendar popup
    $scope.popup = {
      opened: false
    };
    $scope.open = function() {
      $scope.popup.opened = true;
    };

    $scope.dados = {};
    $scope.uploadFile = function() {
      $scope.dados.data.setSeconds(new Date().getSeconds());
      $scope.dados.data.setMinutes(new Date().getMinutes());
      $scope.dados.data.setHours(new Date().getHours());
      $scope.promise = dataFactory
        .novaVersao($scope.dados.workspace, $scope.dados)
        .success(function() {
          $window.alert("Nova workspace adicionada com sucesso.");
          $route.reload();
        })
        .error(function() {
          $window.alert("Ocorreu um erro na execução.");
        });
    };
  };

  atualizarCtrl.$inject = ["$scope", "$window", "$route", "dataFactory"];

  angular.module("fmeApp").controller("atualizarCtrl", atualizarCtrl);
})();
