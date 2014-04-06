var coord = {lat:0,lon:0}
// === Geolocation ===

function show_map(position) {
  coord.lat = position.coords.latitude;
  coord.lon = position.coords.longitude;
  console.log(position);
  initialize();
}

function get_location() {
  if (Modernizr.geolocation) {
    navigator.geolocation.getCurrentPosition(show_map);
  } else {
    // no native support; maybe try a fallback?
  }
}


var app = angular.module('BoShamRowApp', ['facebook']);

app.config(['FacebookProvider', function(FacebookProvider) {
     FacebookProvider.init('1417732778486013');
}]);

function MarkersController($http) {
  var icons = ['/img/rock-small.png','/img/paper-small.png','/img/scissors-small.png']
	var bounds = new google.maps.LatLngBounds();

  function showMap(position) {
    coord.lat = position.coords.latitude;
    coord.lon = position.coords.longitude;
    console.log(position);
    var mapOptions = {
      center: new google.maps.LatLng(coord.lat,coord.lon),
      zoom: 18
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(coord.lat,coord.lon),
      map: map,
      icon:icons[Math.floor(Math.random()*icons.length)],
    });

    bounds.extend(marker.position);

		$http.get("/matches.json")
	    .success(function(data) {
	      console.log(data);
	      data.forEach(function(person){
	        var marker = new google.maps.Marker({
	          position: new google.maps.LatLng(person.lat,person.lng),
	          map: map,
	          title: person.name,
	          icon:icons[Math.floor(Math.random()*icons.length)],
	        });
	        bounds.extend(marker.position);
	      });
	      map.fitBounds(bounds);
	    })
  }
  if (Modernizr.geolocation) {
    navigator.geolocation.getCurrentPosition(showMap);
  }
}

app.controller('FindMatchController', function($scope, $http, Facebook) {
  $scope.showLogin = true;

  // Here, usually you should watch for when Facebook is ready and loaded
  $scope.$watch(function() {
    return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
  }, function(newVal) {
    if (newVal) {
      console.log("facebook ready: ", newVal);
      $scope.getLoginStatus();
    }
    // $scope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
  });

  // From now on you can use the Facebook service just as Facebook api says
  // Take into account that you will need $scope.$apply when inside a Facebook function's scope and not angular
  $scope.login = function() {
    Facebook.login(function(response) {
      console.log("Finished FB login");
      $scope.getLoginStatus();
    });
  };

  $scope.getLoginStatus = function() {
    console.log("start get FB status");
    Facebook.getLoginStatus(function(response) {
      console.log("end get FB status", response);
      if(response.status == 'connected') {
        $scope.$apply(function() {
          $scope.showLogin = false;
          $scope.showMap = true;
          $scope.me();
        });
      }
      else {
        $scope.$apply(function() {
          $scope.showLogin = true;
          $scope.showMap = false;
        });
      }
    })};

    $scope.me = function() {
      Facebook.api('/me', function(response) {
        $scope.$apply(function() {
          // Here you could re-check for user status (just in case)
          $scope.user = response;
          $scope.user.score = 150;
        });
      });
    };

  $scope.didClickButton = function () {
    $scope.findingMatch = true;
    $http.post('/match_requests')
    .success(function(data) {

    }).error(function(err) {
      $scope.findingMatch = false;
      $scope.errorMessage = "Sorry, we can't find a match right now.";
    });
  };
});
