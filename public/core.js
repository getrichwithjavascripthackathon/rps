
// === Geolocation ===

function show_map(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  console.log(position);
  alert(latitude + ", " + longitude);
}

function get_location() {
  if (Modernizr.geolocation) {
    navigator.geolocation.getCurrentPosition(show_map);
  } else {
    // no native support; maybe try a fallback?
  }
}

get_location();
