angular.module('BoShamRowApp').controller('MarkersController', function($scope, $http) {
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
