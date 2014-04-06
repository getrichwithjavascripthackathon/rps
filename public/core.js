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



// === Map ===
 var icons = ['/img/rock-small.png','/img/paper-small.png','/img/scissors-small.png']
 var initialize = function() {
    var mapOptions = {
      center: new google.maps.LatLng(coord.lat,coord.lon),
      zoom: 18
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(coord.lat,coord.lon),
      map: map,
      title:"Hello World!",
      icon:icons[Math.floor(Math.random()*icons.length)],
    });
}
 
  
//  google.maps.event.addDomListener(window, 'load', get_location());


function MarkersController($http) {
	console.log("Setting up controller");
//	var bounds = new google.maps.LatLngBounds();

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
      title:"Hello World!",
      icon:icons[Math.floor(Math.random()*icons.length)],
    }
//    bounds.extend(marker.position);
    );

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
	      });
	    })
  }
  if (Modernizr.geolocation) {
    navigator.geolocation.getCurrentPosition(showMap);
  } 
}

function FindMatchController($scope){
  $scope.didClickButton = function (){
    $scope.findingMatch = true;
  };
}

