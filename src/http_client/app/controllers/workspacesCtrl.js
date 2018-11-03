(function() {
  "use strict";

  var workspacesCtrl = function($scope, dataFactory, DTOptionsBuilder) {
    $scope.tabelas = [];
    $scope.versoes = [];
    $scope.categorias = [];
    $scope.usuarios = [];
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
      dataFactory.getUsuarios().then(
        function success(response) {
          $scope.usuarios = response;
        },
        function error(response) {
          //FIXME
        }
      );
    };

    $scope.reload();

    $scope.saveVersao = function(data) {
      console.log(data);
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
      data.description = data.description.trim();
      data.name = data.name.trim();
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
          value = c.name;
        }
      });
      if (value === "") {
        return "Erro";
      }
      return value;
    };

    $scope.showUsuario = function(usuario) {
      var value = "";
      $scope.usuarios.forEach(function(c) {
        if (c.id == usuario) {
          value = c.name;
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

  workspacesCtrl.$inject = ["$scope", "dataFactory", "DTOptionsBuilder"];

  angular.module("fmeApp").controller("workspacesCtrl", workspacesCtrl);
})();
