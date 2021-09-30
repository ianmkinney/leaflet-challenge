// geojson urls
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(queryUrl, function(response) {

    createMarkers(response.features);

});

function createMarkers(earthquakeData) {

    function onEachFeature(feature, layer) {

        var format = d3.timeFormat("%d-%b-%Y at %H:%M");

        layer.bindPopup(`<strong>Place: </strong> ${feature.properties.place}<br><strong>Time: </strong>${format(new Date(feature.properties.time))}<br><strong>Magnitude: </strong>${feature.properties.mag}`);
    };

    var earthquakes = L.geoJSON(earthquakeData, {

        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: magColor(feature.properties.mag),
                color: "#000",
                weight: 0.3,
                opacity: 0.5,
                fillOpacity: 1
            });
        },
        onEachFeature: onEachFeature
    });

    d3.json(tectonicUrl, function(response) {

        var tecFeatures = response.features;

        var plateData = L.geoJSON(tecFeatures, {
            color: "blue"
        });


        createMap(earthquakes, plateData);
    });

}; 


function createMap(earthquakes, faultlines) {

    var centerCoordinates = [30.0902, 0];
    var mapZoom = 2.2;

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    var light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Light": light,
        "Satellite": satellite,
        "Outdoors": outdoors
    };

    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": faultlines
    };


    var myMap = L.map("map", {
        center: centerCoordinates,
        zoom: mapZoom,
        layers: [satellite, faultlines, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var magnitudes = [0, 1, 2, 3, 4, 5];
        var labels = [];
        var legendInfo = "<h5>Magnitude</h5>";

        div.innerHTML = legendInfo;

        for (var i = 0; i < magnitudes.length; i++) {
            labels.push('<li style="background-color:' + magColor(magnitudes[i] + 1) + '"> <span>' + magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '' : '+') + '</span></li>');
        }

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";

        return div;
    };

    
    legend.addTo(myMap);

}; 

function markerSize(magnitude) {
    return magnitude * 3;
}

function magColor(magnitude) {
    if (magnitude <= 1) {
        return "#a7fb09"
    } else if (magnitude <= 2) {
        return "#dcf900"
    } else if (magnitude <= 3) {
        return "#f6de1a"
    } else if (magnitude <= 4) {
        return "#fbb92e"
    } else if (magnitude <= 5) {
        return "#faa35f"
    } else {
        return "#ff5967"
    }
};