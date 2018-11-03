(function() {
  "use strict";

  var categoriasCtrl = function($scope, dataFactory, DTOptionsBuilder) {
    $scope.categorias = [];
    $scope.reload = function() {
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

    //edição
    $scope.checkName = function(data, id) {
      if (data.trim() == "") {
        return "Este nome não é válido.";
      }
      var erro = false;
      $scope.categorias.forEach(function(d) {
        if (d.name === data.trim() && d.id != id) {
          erro = true;
        }
      });
      if (erro) return "Este nome já existe.";
    };

    $scope.cancel = function(data, id) {
      if (data.trim() === "") {
        $scope.categorias = $scope.categorias.filter(function(e) {
          return e.id != id;
        });
      }
    };

    $scope.saveCategoria = function(data, id) {
      data.name = data.name.trim();
      if (typeof id === "string" && id.substring(0, 3) === "new") {
        dataFactory
          .insertCategoria(data)
          .then(function() {
            $scope.reload();
          })
          .catch(function() {
            console.log("erro");
          });
      } else {
        angular.extend(data, { id: id });
        dataFactory
          .updateCategoria(data)
          .then(function() {
            $scope.reload();
          })
          .catch(function() {
            console.log("erro");
          });
      }
    };

    // add user
    $scope.addCategoria = function() {
      $scope.inserted = {
        id: "new_" + $scope.categorias.length + 1,
        name: ""
      };
      $scope.categorias.push($scope.inserted);
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

  categoriasCtrl.$inject = ["$scope", "dataFactory", "DTOptionsBuilder"];

  angular.module("fmeApp").controller("categoriasCtrl", categoriasCtrl);
})();
