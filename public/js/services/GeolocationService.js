'use strict';

angular.module('BoShamRowApp').service('Geolocation', function($rootScope, $timeout) {

  function getLocation() {
    console.log("-> getLocation");
    if (Modernizr.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $rootScope.$broadcast('currentPosition', position);
      });
      $timeout(getLocation, 5000);
    } else {
      console.log("ERROR: geolocation is not supported by the browser");
    }
  }

  return { start: getLocation };
});
