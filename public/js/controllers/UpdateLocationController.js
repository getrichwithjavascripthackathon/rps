'use strict';

angular.module('BoShamRowApp')
.controller('UpdateLocationController', function($scope, $http, Geolocation, Login) {
  Geolocation.start();

  $scope.$on('currentPosition', function(_, position) {
    console.log("got position in UpdateLocationController", position);
    Login.getPlayerEmail().then(function(playerEmail) {
      $http.post('/api/v1/position', {
        email: playerEmail,
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });
    });
  })
});
