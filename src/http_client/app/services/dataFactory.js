(function() {
  "use strict";
  var dataFactory = function($http, $q) {
    var factory = {};

    factory.tabelasVersao = [];
    factory.tabelasUltimaVersao = [];
    factory.tabelas = [];
    factory.logs = [];
    factory.categorias = [];

    factory.statusExecucao = {};

    var urlpath = "http://localhost:3006/";

    factory.get = function(url) {
      //promise that the data will load
      var q = $q.defer();

      $http({
        method: "GET",
        url: url
      }).then(
        function successCallback(response) {
          //merge arrays
          var result = response.data;
          q.resolve(result);
        },
        function errorCallback(response) {
          //FIXME show message Layer not available
          q.reject("erro");
        }
      );

      return q.promise;
    };

    //retorna todas as workspaces
    factory.getTabelasVersao = function() {
      return factory.get(urlpath + "versions").then(function(result) {
        factory.tabelasVersao = result;
        factory.tabelasVersao.forEach(function(d) {
          d.link = urlpath + d.path;
        });
      });
    };

    factory.getTabelas = function() {
      return factory.get(urlpath + "workspaces").then(function(result) {
        factory.tabelas = result;
      });
    };

    //retorna todas os logs de execucao
    factory.getLogs = function() {
      return factory.get(urlpath + "jobs").then(function(result) {
        factory.logs = result;
      });
    };

    //retorna todas as categorias
    factory.getCategorias = function() {
      return factory.get(urlpath + "categorias").then(function(result) {
        return result;
      });
    };

    //retorna ultima versão de cada workspace
    factory.getTabelasUltimaVersao = function() {
      return factory.get(urlpath + "versions?last=true").then(function(result) {
        factory.tabelasUltimaVersao = result;
      });
    };

    factory.insertCategoria = function(data) {
      var q = $q.defer();

      $http({
        method: "POST",
        url: urlpath + "categorias",
        data: data
      }).then(
        function successCallback(response) {
          q.resolve("success");
        },
        function errorCallback(response) {
          //FIXME show message Layer not available
          q.reject("erro");
        }
      );

      return q.promise;
    };

    factory.updateCategoria = function(data) {
      var q = $q.defer();

      $http({
        method: "PUT",
        url: urlpath + "categorias/" + data.id,
        data: data
      }).then(
        function successCallback(response) {
          q.resolve("success");
        },
        function errorCallback(response) {
          //FIXME show message Layer not available
          q.reject("erro");
        }
      );

      return q.promise;
    };

    factory.updateWorkspace = function(data) {
      var q = $q.defer();

      $http({
        method: "PUT",
        url: urlpath + "workspaces/" + data.id,
        data: data
      }).then(
        function successCallback(response) {
          q.resolve("success");
        },
        function errorCallback(response) {
          //FIXME show message Layer not available
          q.reject("erro");
        }
      );

      return q.promise;
    };

    factory.updateVersao = function(data) {
      var q = $q.defer();

      $http({
        method: "PUT",
        url: urlpath + "versions/" + data.id,
        data: data
      }).then(
        function successCallback(response) {
          q.resolve("success");
        },
        function errorCallback(response) {
          //FIXME show message Layer not available
          q.reject("erro");
        }
      );

      return q.promise;
    };

    factory.novaTabela = function(workspace, dados) {
      var fd = new FormData();
      fd.append("workspace", workspace);
      fd.append("nome", dados.nome);
      fd.append("descricao", dados.descricao);
      fd.append("autor", dados.autor);
      fd.append("versao", dados.versao);
      fd.append("data", dados.data);
      fd.append("categoria", dados.categoria);

      return $http.post(urlpath + "workspaces", fd, {
        transformRequest: angular.identity,
        headers: { "Content-Type": undefined }
      });
    };

    factory.novaVersao = function(workspace, dados) {
      var fd = new FormData();
      fd.append("workspace", workspace);
      fd.append("autor", dados.autor);
      fd.append("versao", dados.versao);
      fd.append("data", dados.data);

      return $http.post(
        urlpath + "workspaces/" + dados.workspaceid + "/versions",
        fd,
        {
          transformRequest: angular.identity,
          headers: { "Content-Type": undefined }
        }
      );
    };

    factory.executar = function(workspaceid, dados) {
      //promise that the data will load
      var q = $q.defer();
      factory
        .sendJob(workspaceid, dados)
        .then(function(jobid) {
          return factory.verifyJob(jobid);
        })
        .then(function(job) {
          q.resolve(job);
        })
        .catch(function(response) {
          q.reject("erro");
        });

      return q.promise;
    };

    factory.verifyJob = function(jobid) {
      var q = $q.defer();
      var resposta = false;
      var reqcount = 0;

      function requestLoop() {
        setTimeout(function() {
          $http({
            method: "GET",
            url: urlpath + "jobs/" + jobid
          })
            .then(function(response) {
              if (response.data.status == "Executado") {
                resposta = true;
                q.resolve(response.data);
              }
              if (response.data.data.status == "Erro") {
                resposta = true;
                q.reject(response.status);
              }
            })
            .catch(function(response) {
              resposta = true;
              q.reject("erro");
            });

          reqcount++;

          if (!resposta && reqcount < 100) {
            requestLoop();
          }
        }, 3000);
      }

      requestLoop();

      return q.promise;
    };

    factory.sendJob = function(versionid, dados) {
      var q = $q.defer();
      $http({
        method: "POST",
        url: urlpath + "versions/" + versionid + "/jobs",
        data: { parametros: dados }
      })
        .then(function(response) {
          q.resolve(response.data.jobid);
        })
        .catch(function(response) {
          q.reject("erro");
        });

      return q.promise;
    };

    return factory;
  };
  dataFactory.$inject = ["$http", "$q"];

  angular.module("fmeApp").factory("dataFactory", dataFactory);
})();
