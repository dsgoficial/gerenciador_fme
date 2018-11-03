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

    var urlpath = "/";

    factory.get = function(url) {
      //promise that the data will load
      var q = $q.defer();

      $http({
        method: "GET",
        url: url
      }).then(
        function successCallback(response) {
          //merge arrays
          var result = response.data.data;
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
          d.link = urlpath + d.workspace_path;
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
      return factory.get(urlpath + "categories").then(function(result) {
        return result;
      });
    };

    //retorna todas os usuarios
    factory.getUsuarios = function() {
      return factory.get(urlpath + "users").then(function(result) {
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
        url: urlpath + "categories",
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
        url: urlpath + "categories/" + data.id,
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
      var dados = {
        name: data.version_name,
        author: data.version_author,
        version_date: data.version_date,
        accessible: data.accessible
      };
      $http({
        method: "PUT",
        url: urlpath + "versions/" + data.id,
        data: dados
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
      fd.append("name", dados.nome);
      fd.append("description", dados.descricao);
      fd.append("version_author_id", dados.autor);
      fd.append("version_name", dados.versao);
      fd.append("version_date", dados.data);
      fd.append("category_id", dados.categoria);

      return $http.post(urlpath + "workspaces", fd, {
        transformRequest: angular.identity,
        headers: { "Content-Type": undefined }
      });
    };

    factory.novaVersao = function(workspace, dados) {
      var fd = new FormData();
      fd.append("workspace", workspace);
      fd.append("version_author", dados.autor);
      fd.append("version_name", dados.versao);
      fd.append("version_date", dados.data);

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
              if (response.data.data.status == 2) {
                resposta = true;
                q.resolve(response.data.data);
              }
              if (response.data.data.status == 3) {
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
        data: { parameters: dados }
      })
        .then(function(response) {
          q.resolve(response.data.data.job_uuid);
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
