(function() {
  "use strict";

  var inserirCtrl = function($scope, $window, $route, dataFactory) {
    //inicializa as tabelas
    $scope.categorias = [];
    $scope.usuarios = [];
    $scope.reload = function() {
      dataFactory.getCategorias().then(
        function success(response) {
          $scope.categorias = response;
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
        .novaTabela($scope.dados.workspace, $scope.dados)
        .success(function() {
          $window.alert("Nova workspace adicionada com sucesso.");
          $route.reload();
        })
        .error(function() {
          $window.alert("Ocorreu um erro na execução.");
        });
    };
  };

  inserirCtrl.$inject = ["$scope", "$window", "$route", "dataFactory"];

  angular.module("fmeApp").controller("inserirCtrl", inserirCtrl);
})();
