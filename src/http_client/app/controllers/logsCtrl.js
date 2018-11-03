(function() {
  "use strict";

  var logsCtrl = function($scope, dataFactory, DTOptionsBuilder) {
    $scope.logs = [];
    $scope.reload = function() {
      dataFactory.getLogs().then(
        function success(response) {
          dataFactory.logs.forEach(function(log) {
            var aux = [];
            log.parameters.split(" | ").forEach(function(l) {
              if (l.split(":")[0] != "LOG_FILE") {
                aux.push(l);
              }
            });
            log.parameters = aux.join(" | ");
          });

          $scope.logs = dataFactory.logs;
        },
        function error(response) {
          //FIXME
        }
      );
    };

    $scope.reload();

    $scope.dtOptions = DTOptionsBuilder.newOptions()
      .withPaginationType("full_numbers")
      .withDisplayLength(10)
      .withLanguage({
        sEmptyTable: "Nenhum registro encontrado",
        sInfo: "Mostrando de _START_ a _END_ de um total de _TOTAL_ registros",
        sInfoEmpty: "Mostrando 0 to 0 of 0 entries",
        sInfoFiltered: "(filtrado de um total de _MAX_ registros)",
        sInfoPostFix: "",
        sInfoThousands: ",",
        sLengthMenu: "Mostrar _MENU_ itens por página",
        sLoadingRecords: "Carregando...",
        sProcessing: "Processando...",
        sSearch: "Busca: ",
        sZeroRecords: "Nenhum registro encontrado",
        oPaginate: {
          sFirst: "Primeiro",
          sLast: "Último",
          sNext: "Próximo",
          sPrevious: "Anterior"
        }
      });
  };

  logsCtrl.$inject = ["$scope", "dataFactory", "DTOptionsBuilder"];

  angular.module("fmeApp").controller("logsCtrl", logsCtrl);
})();
