(function() {
  "use strict";
  var loginFactory = function($localStorage, $window, $q) {
    var factory = {};

    factory.loginUrl = "/login";

    factory.usuario = {};

    factory.getToken = function() {
      return $localStorage.token;
    };

    factory.setToken = function(token) {
      $localStorage.token = token;

      //  parse no token (Base64 por definição)
      factory.usuario = jwt_decode(token);
    };

    factory.logout = function() {
      var q = $q.defer();

      delete $localStorage.token;
      factory.usuario = {};
      q.resolve();

      return q.promise;
    };

    return factory;
  };
  loginFactory.$inject = ["$localStorage", "$window", "$q"];

  angular.module("fmeApp").factory("loginFactory", loginFactory);
})();
