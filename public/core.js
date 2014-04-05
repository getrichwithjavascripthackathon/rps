var coord = {lat:0,lon:0}
// === Geolocation ===

function show_map(position) {
  coord.lat = position.coords.latitude;
  coord.lon = position.coords.longitude;
  console.log(position);
  map.initialize();
}

function get_location() {
  if (Modernizr.geolocation) {
    navigator.geolocation.getCurrentPosition(show_map);
  } else {
    // no native support; maybe try a fallback?
  }
}



// === Map ===
  var map = {};
//  var map.coord = {lat:position.coords.latitude,lon:position.coords.longitude}
  map.initialize = function() {
    var mapOptions = {
      center: new google.maps.LatLng(coord.lat,coord.lon),
      zoom: 15
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
  }
  google.maps.event.addDomListener(window, 'load', get_location());

