(function() {
  "use strict";
  var authInterceptor = function($location, loginFactory, $q) {
    var factory = {};

    factory.request = function(config) {
      config.headers = config.headers || {};

      if (loginFactory.getToken()) {
        config.headers["Authorization"] = loginFactory.getToken();
      }

      return config;
    };

    factory.responseError = function(response) {
      if (response.status === 401 || response.status === 403) {
        loginFactory.logout().then(function() {
          $location.path("/");
        });
      }

      return $q.reject(response);
    };

    return factory;
  };
  authInterceptor.$inject = ["$location", "loginFactory", "$q"];

  angular
    .module("fmeApp")
    .factory("authInterceptor", authInterceptor)
    .config(function($httpProvider) {
      $httpProvider.interceptors.push("authInterceptor");
    });
})();
