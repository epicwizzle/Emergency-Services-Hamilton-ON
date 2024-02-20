/**
 * "StAuth10244: I Esenwa Michael, 000876059 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else."
 */
/**
 * This function is called when the Google Maps API is loaded.
 */
function initMap() {
    const list = [];
    const hamilton = { lat: 43.255203, lng: -79.843826 };
    const mapOptions = {
        zoom: 12,
        center: hamilton
    };

    const map = new google.maps.Map(document.getElementById("map"), mapOptions);

    function createMarker({ lat, lng }, icon, dataName, name, address, company) {
        const marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            icon,
            animation: google.maps.Animation.DROP,
            name: dataName

        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<h4>${name}</h4><p>${address}</p>`
        });

        marker.addListener("click", function () {
            infoWindow.open(map, marker);
            updateInfoPanel(lat, lng, name, address, company);
        });

        list.push(marker);
    }
    /**
     * This function updates the information panel with the given parameters
     * @param {*} lat this is the latitude of the location
     * @param {*} lng  this is the longitude of the location
     * @param {*} name this is the name of the location
     * @param {*} address this is the address of the location
     * @param {*} company this is the type of location
     */
    function updateInfoPanel(lat, lng, name, address, company) {
        document.getElementById("lat").innerHTML = `Latitude: ${lat}`;
        document.getElementById("lng").innerHTML = `Longitude: ${lng}`;
        document.getElementById("address").innerHTML = `Address: ${address}`;
        if (company) {
            document.getElementById("name").innerHTML = `${company}: ${name}`;
        }else{
            document.getElementById("name").innerHTML = name;
        }
    }
    /**
     * this function fetches the data from the given url and adds the markers to the map
     * @param {*} url This is the json file that contains the data
     * @param {*} icon This is the icon that will be used for the marker
     * @param {*} company This is the type of location
     */
    function fetchAndAddMarkers(url, icon, company) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const dataName = data.name;
                data.features.forEach(element => {
                    const name = element.properties.NAME;
                    const address = element.properties.ADDRESS;
                    const lat = element.geometry.coordinates[1];
                    const lng = element.geometry.coordinates[0];

                    createMarker({ lat, lng }, icon, dataName, name, address, company);
                });
            });
    }
    /**
     * This function filters the markers based on the type of location
     * @param {*} type This is the type of location
     */
    function filterMarkers(type) {
        list.forEach(marker => {
            if (marker.name !== type) {
                marker.setMap(null);
            } else {
                marker.setMap(map);
            }
        });
    }
    /**
     * This function shows all the markers on the map
     */
    function showAllMarkers() {
        list.forEach(marker => marker.setMap(map));
    }
    /**
     * This function gets the current location of the user and adds a marker to the map
     * @param {*} position this is the position of the user
     */
    function getCurrentLocation(position) {
        const location = new google.maps.Marker({
            position: { lat: position.coords.latitude, lng: position.coords.longitude },
            map,
            animation: google.maps.Animation.DROP,
            icon: "https://maps.google.com/mapfiles/kml/paddle/ylw-stars.png"
        });

        map.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });

        const infoWindow = new google.maps.InfoWindow({
            content: "<h4>Current Location</h4>"
        });

        location.addListener("click", function () {
            infoWindow.open(map, location);
            updateInfoPanel(position.coords.latitude, position.coords.longitude, "Current Location");

            geoCoder.geocode({ location: { lat: position.coords.latitude, lng: position.coords.longitude } }, function (results, status) {
                document.getElementById("address").innerHTML = `Address: ${results[0].formatted_address}`;
            });
        });

        location.setMap(map);
        list.push(location);
    }

    document.getElementById("police").addEventListener("click", () => filterMarkers("Police_Stations"));
    document.getElementById("hospital").addEventListener("click", () => filterMarkers("Hospitals"));
    document.getElementById("fire").addEventListener("click", () => filterMarkers("Fire_Stations"));
    document.getElementById("all").addEventListener("click", showAllMarkers);
    document.getElementById("geo-locate").addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getCurrentLocation);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    fetchAndAddMarkers('./Police_Stations.geojson', "https://maps.google.com/mapfiles/kml/paddle/blu-stars.png", "Police Station");
    fetchAndAddMarkers('./Hospitals.geojson', "https://maps.google.com/mapfiles/kml/paddle/grn-stars.png", "Hospital");
    fetchAndAddMarkers('./Fire_Stations.geojson', "https://maps.google.com/mapfiles/kml/paddle/red-stars.png", "Fire Station");

    const geoCoder = new google.maps.Geocoder();

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    
    directionsDisplay.setMap(map);
    /**
     * This function gets the current location of the user and calculates the route to the given end location
     * @param {*} end 
     */
    function calculateRoute(end) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
    
            var request = {
                origin: pos,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC

            };
    
            directionsService.route(request, function (result, status) {
                if (status == 'OK') {
                    directionsDisplay.setDirections(result);
                    document.getElementById("name").innerHTML = ('Distance: ' + result.routes[0].legs[0].distance.text + 'and  Duration: ' + result.routes[0].legs[0].duration.text);
                } else {
                    alert("Directions request failed:", status);
                }
            });
        });
        
        list.forEach(marker => marker.setMap(null));
    }
    
    var listItems = document.getElementById("directions");
    var li = listItems.getElementsByTagName("li");
    
    for (var i = 0; i < li.length; i++) {
        li[i].addEventListener("click", function () {
            var end = this.getAttribute("id");
            calculateRoute(end);
        });
    }

    var input = document.getElementById('search');

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function() {
        infoWindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        marker.setIcon(({	
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
    
        var address = '';
        if (place.address_components) {
            address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
    
        infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infoWindow.open(map, marker);
    });

    


console.log("Script loaded");


    


}



