(function() {
  "use strict";

  var workspacesCtrl = function(
    $scope,
    $uibModal,
    dataFactory,
    DTOptionsBuilder
  ) {
    $scope.tabelas = [];
    $scope.versoes = [];
    $scope.categorias = [];
    $scope.reload = function() {
      dataFactory.getTabelasVersao().then(
        function success(response) {
          $scope.versoes = dataFactory.tabelasVersao;
        },
        function error(response) {
          //FIXME
        }
      );
      dataFactory.getTabelas().then(
        function success(response) {
          $scope.tabelas = dataFactory.tabelas;
        },
        function error(response) {
          //FIXME
        }
      );
      dataFactory.getCategorias().then(
        function success(response) {
          $scope.categorias = response;
        },
        function error(response) {
          //FIXME
        }
      );
    };

    $scope.reload();

    $scope.saveVersao = function(data) {
      dataFactory
        .updateVersao(data)
        .then(function() {
          $scope.reload();
        })
        .catch(function() {
          console.log("erro");
        });
    };

    $scope.saveWorkspace = function(data) {
      data.descricao = data.descricao.trim();
      data.nome = data.nome.trim();
      dataFactory
        .updateWorkspace(data)
        .then(function() {
          $scope.reload();
        })
        .catch(function() {
          console.log("erro");
        });
    };

    $scope.showCategoria = function(categoria) {
      var value = "";
      $scope.categorias.forEach(function(c) {
        if (c.id == categoria) {
          value = c.nome;
        }
      });
      if (value === "") {
        return "Erro";
      }
      return value;
    };

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

  workspacesCtrl.$inject = [
    "$scope",
    "$uibModal",
    "dataFactory",
    "DTOptionsBuilder"
  ];

  angular.module("fmeApp").controller("workspacesCtrl", workspacesCtrl);
})();
