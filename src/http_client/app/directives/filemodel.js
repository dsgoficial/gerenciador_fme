(function() {
  "use strict";
  //http://stackoverflow.com/questions/32957006/nodejs-multer-angularjs-for-uploading-without-redirecting
  angular.module("fmeApp").directive("fileModel", [
    "$parse",
    function($parse) {
      return {
        restrict: "A",
        link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;

          element.bind("change", function() {
            scope.$apply(function() {
              modelSetter(scope, element[0].files[0]);
            });
          });
        }
      };
    }
  ]);
})();
