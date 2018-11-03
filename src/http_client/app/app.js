(function() {
  "use strict";

  //ui.bootstrap https://angular-ui.github.io/bootstrap/ - MIT License
  //ngRoute https://docs.angularjs.org/api/ngRoute - MIT License
  //ngMessages https://docs.angularjs.org/api/ngMessages/directive/ngMessages - MIT License
  //  ngStorage https://github.com/gsklee/ngStorage
  var app = angular.module("fmeApp", [
    "ui.bootstrap",
    "ngRoute",
    "ngMessages",
    "cgBusy",
    "xeditable",
    "datatables",
    "datatables.bootstrap",
    "ngStorage"
  ]);

  app.config(function($routeProvider) {
    $routeProvider
      .when("/", {
        controller: "loginCtrl",
        templateUrl: "app/views/login.html"
      })
      .when("/main", {
        controller: "mainCtrl",
        templateUrl: "app/views/index.html"
      })
      .otherwise({
        redirectTo: "/"
      });
  });

  app.run(function(editableOptions) {
    editableOptions.theme = "bs3"; // bootstrap3 theme. Can be also 'bs2', 'default'
  });

  app.filter("startFrom", function() {
    return function(input, start) {
      if (input) {
        start = +start;
        return input.slice(start);
      }

      return [];
    };
  });

  /**
   * AngularJS default filter with the following expression:
   * "person in people | filter: {name: $select.search, age: $select.search}"
   * performs a AND between 'name: $select.search' and 'age: $select.search'.
   * We want to perform a OR.
   */
  app.filter("propsFilter", function() {
    return function(items, props) {
      var out = [];

      if (angular.isArray(items)) {
        items.forEach(function(item) {
          var itemMatches = false;

          var keys = Object.keys(props);
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (
              item[prop]
                .toString()
                .toLowerCase()
                .indexOf(text) !== -1
            ) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }

      return out;
    };
  });

  app.filter("datefilter", function() {
    return function(items, from, to) {
      if (Array.isArray(items) && from && to) {
        var df = Date.parse(from);
        var dt = Date.parse(to);
        var arrayToReturn = [];
        for (var i = 0; i < items.length; i++) {
          var tf = Date.parse(items[i].dataInicio);
          var tt = Date.parse(items[i].dataFim);
          if (tf > df && tt < dt) {
            arrayToReturn.push(items[i]);
          }
        }

        return arrayToReturn;
      }

      return items;
    };
  });
})();
