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

app.controller('MarkersController', function($scope, $http) {
  var icons = ['/img/rock-small.png','/img/paper-small.png','/img/scissors-small.png']
  var fakeMarkersData = [];
  var fakeMarkers = [];
  var myPosition;
  var myMarker;
  var map;

  function createMap() {
    if (map) return;
    var mapOptions = {
      zoom: 18
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  }

  function updateMyMarker() {
    coord.lat = myPosition.coords.latitude;
    coord.lng = myPosition.coords.longitude;
    if (!myMarker) {
      myMarker = new google.maps.Marker({
        map: map,
        icon:icons[Math.floor(Math.random()*icons.length)],
      });
    }
    myMarker.setPosition(new google.maps.LatLng(coord.lat, coord.lng));
  }

  function updateFakeMarkers() {
    fakeMarkers = [];
    fakeMarkersData.forEach(function(person){
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(person.lat,person.lng),
        map: map,
        title: person.name,
        icon:icons[Math.floor(Math.random()*icons.length)],
      });
      fakeMarkers.push(marker);
    });
  }

  function updateZoom() {
    if (!myMarker) return;

    google.maps.event.trigger(map, "resize");

    var bounds = new google.maps.LatLngBounds();
    bounds.extend(myMarker.position);

    fakeMarkers.forEach(function(marker) {
      bounds.extend(marker.position);
    });

    map.fitBounds(bounds);
  }

  function showMap(_, position) {
    myPosition = position;
    createMap();
    updateMyMarker();
    updateZoom();
  }

  $scope.$on('currentPosition', showMap);

  $http.get("/matches.json")
  .success(function(data) {
    fakeMarkersData = data;
    createMap();
    updateFakeMarkers();
    updateZoom();
  });
});

app.controller('FindMatchController', function($scope, $http, Facebook, Login) {
  $scope.show = "loading";
  $scope.loadingMessage = "Waiting for Facebook";

  // Here, usually you should watch for when Facebook is ready and loaded
  $scope.$watch(function() {
    return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
  }, function(newVal) {
    if (newVal) {
      console.log("facebook ready: ", newVal);
      $scope.loadingMessage = undefined;
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
    }, {scope: 'email'});
  };

  $scope.getLoginStatus = function() {
    $scope.show = 'loading';
    $scope.loadingMessage = "Checking for login";
    console.log("start get FB status");
    Login.checkLogin(function(user) {
      $scope.user = user;
      $scope.user.score = 150;
      $scope.show = 'map';
      $scope.loadingMessage = undefined;
    }, function() {
      $scope.$apply(function() {
        $scope.show = 'login';
      });
    });
  };

  $scope.didClickButton = function () {
    $scope.findingMatch = true;
    $http.post('/api/v1/match_requests')
    .success(function(data) {

    }).error(function(err) {
      $scope.findingMatch = false;
      $scope.errorMessage = "Sorry, we can't find a match right now.";
    });
  };
});
