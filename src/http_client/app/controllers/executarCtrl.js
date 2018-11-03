(function() {
  "use strict";

  var executarCtrl = function($scope, $uibModal, dataFactory) {
    $scope.tabelas = [];
    $scope.categorias = [];
    $scope.collapsed = [];

    //inicializa as tabelas
    $scope.reload = function() {
      dataFactory.getTabelasUltimaVersao().then(
        function success(response) {
          dataFactory.tabelasUltimaVersao.forEach(function(d) {
            d.paramValues = {};
            $scope.collapsed.push(true);
          });
          $scope.tabelas = dataFactory.tabelasUltimaVersao;
        },
        function error(response) {}
      );

      dataFactory.getCategorias().then(
        function success(response) {
          $scope.categorias = response;
        },
        function error(response) {}
      );
    };
    $scope.reload();

    $scope.executa = function(tabela) {
      $scope.promise = dataFactory
        .executar(tabela.id, tabela.paramValues)
        .then(function(resp) {
          var modalAlertInstance = $uibModal.open({
            animation: true,
            templateUrl: "app/views/modal/alert.html",
            controller: "alertCtrl",
            size: "lg",
            resolve: {
              alert: function() {
                return {
                  header: "Sucesso",
                  content: "Workspace executada com sucesso.",
                  log: resp.log
                };
              }
            }
          });
        })
        .catch(function() {
          var modalAlertInstance = $uibModal.open({
            animation: true,
            templateUrl: "app/views/modal/alert.html",
            controller: "alertCtrl",
            size: "lg",
            resolve: {
              alert: function() {
                return {
                  header: "Erro",
                  content: "Ocorreu um erro enquanto a workspace era executada."
                };
              }
            }
          });
        });
    };

    //alterna a visualização dos parâmetros
    $scope.collapse = function(id) {
      $scope.collapsed[id] = !$scope.collapsed[id];
    };
  };

  executarCtrl.$inject = ["$scope", "$uibModal", "dataFactory"];

  angular.module("fmeApp").controller("executarCtrl", executarCtrl);

  var alertCtrl = function($scope, $uibModalInstance, alert) {
    $scope.log = [];
    if (alert.log) {
      var log = alert.log.split("|");
      log.forEach(function(d) {
        $scope.log.push({ camada: d.split(":")[0], valor: d.split(":")[1] });
      });
    }

    if (alert.header === "Sucesso") {
      $scope.background = "#0f8845";
    } else {
      $scope.background = "#BA6765";
    }
    $scope.alert = alert;
  };

  alertCtrl.$inject = ["$scope", "$uibModalInstance", "alert"];

  angular.module("fmeApp").controller("alertCtrl", alertCtrl);
})();
