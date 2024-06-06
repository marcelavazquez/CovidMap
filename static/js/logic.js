// Bimbo layer
let bimbolayer = L.layerGroup()

// Define style for bimbo icon
var bimboIcon = L.ExtraMarkers.icon({
    icon: "ion-person",
    iconColor: "white",
    markerColor: "1, 33, 105",
    shape: "circle"
});

// Creating map object
var myMap = L.map("map", {
    center: [24.0964076, -102.0853871],
    zoom: 6,
    layers: [bimbolayer]
});

// Create overlay layer que tiene los iconos de bimbo
let overlayMaps = {
    "Bimbo": bimbolayer
}

// Add to map
L.control.layers(null, overlayMaps).addTo(myMap);


// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v9",
    accessToken: API_KEY
}).addTo(myMap);


// Load in GeoJson data
var geoData = "static/data/municipios_entidad.geojson";

var geojson;


// Function for color
function getColor(d) {
    return d > 100 ? '#084081' :
        d > 30 ? '#0868ac' :
        d > 25 ? '#2b8cbe' :
        d > 20 ? '#4eb3d3' :
        d > 5 ? '#7bccc4' :
        '#a8ddb5';
} // END of getColor

function popup(feature, layer) {
    if (feature.properties && feature.properties.NOM_MUN) {
        layer.bindPopup(feature.properties.NOM_MUN);
    }
}

// funcion o highlight municipio when hovered with mouse
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: 'black',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

// what happens on mouse out
function resetHighlight(e) {
    geojson.resetStyle(e.target);

    info.update();
}

var info = L.control({ position: 'bottomleft' });

// https: //fontawesome.com/v4.7.0/icons/
// Information bimbo box
L.easyButton('fa fa-info fa-lg', function(btn, map) {
    $('#myModal').modal('show');
}, 'Informacije').addTo(myMap);

// Caja que dice que significa % letalidad y % de riesgo
L.easyButton('fa fa-question fa-lg', function(btn, map) {
    $('#theModal').modal('show');
}, 'Informacije').addTo(myMap);


//Grab data with d3
d3.json(geoData, data => {
    console.log(data.features)
    console.log(data.features[345])

    geojson = L.geoJson(data, {
        onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: function(event) {
                    myMap.fitBounds(event.target.getBounds());
                }
            });
            //Giving each feature a pop-up with information pertinent to it
            layer.bindPopup(`<p>Nombre del municipio: ${feature.properties.NOM_MUN}</p> <hr> 
            <p>Número de colaboradores: ${feature.properties.num_colabs}</p>
            <p>Número de bajas por defunción: ${feature.properties.num_bajas}</p>
            <p>Muertes por COVID en el municipio: ${feature.properties.num_def}</p>
            <p>% Letalidad: ${feature.properties.prc_letalidad}</p>
            <p>% Riesgo: ${feature.properties.prc_riesgo}</p>`);
        },
        style(feature) {
            return {
                fillColor: getColor(feature.properties.prc_letalidad),
                weight: 0.3,
                opacity: 4,
                color: 'black',
                fillOpacity: 1
            };
        },
    }).addTo(myMap)

    info.onAdd = function(myMap) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function(props) {
        this._div.innerHTML = '<h5>Nombre del municipio:</h5>' + (props ?
            '<b>' + props.NOM_MUN + '<h5>Número de colaboradores:</h5>' + props.num_colabs +
            '<h5>Número de bajas por defunción:</h5>' + props.num_bajas + '<h5>Muertes por COVID en el municipio:</h5>' + props.num_def +
            '<h5>% Letalidad</h5>' + props.prc_letalidad + '<h5>% Riesgo:</h5>' + props.prc_riesgo :
            'Coloque el mouse sobre un municipio');
    };

    info.addTo(myMap);

    for (let i = 0; i < data.features.length; i++) {
        let municipio = Object.assign({}, data.features[i])
            //console.log(municipio)
        if (municipio.properties.num_colabs !== "N/A") {
            let marker = L.marker([municipio.properties.LAT, municipio.properties.LON], { icon: bimboIcon }).bindPopup(`<h5>Nombre del municipio: ${municipio.properties.NOM_MUN}</h5> <hr> 
            <h5>Número de colaboradores: ${municipio.properties.num_colabs}</h5>
            <h5>Número de bajas por defunción: ${municipio.properties.num_bajas}</h5>
            <h5>Muertes por COVID en el municipio: ${municipio.properties.num_def}</h5>
            <h5>% Letalidad: ${municipio.properties.prc_letalidad}</h5>
            <h5>% Riesgo: ${municipio.properties.prc_riesgo}</h5>`)
            marker.addTo(bimbolayer)
        }
    };

    // Search Box
    // https://mappinggis.com/2016/04/como-insertar-un-control-de-busqueda-en-leaflet/
    controlSearch = new L.Control.Search({
        position: 'topleft',
        layer: geojson,
        propertyName: 'NOM_MUN',
        circleLocation: false,
        zoom: 10,
        marker: false
    });

    // Highlight when located
    controlSearch.on('search:locationfound', function(e) {

        e.layer.setStyle({ fillColor: '#FF0000', color: '#808080' });
        if (e.layer._popup)
            e.layer.openPopup();

    }).on('search:collapsed', function(e) {

        bimbolayer.eachLayer(function(layer) { //restore feature color
            bimbolayer.resetStyle(layer);
        });
    });

    myMap.addControl(controlSearch); // END of Search Box

    // Create legend
    // https://gis.stackexchange.com/questions/141745/horizontal-legend-leaflet-js
    var legend = L.control({ position: 'topright' });

    legend.onAdd = function(map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 5, 20, 25, 30, 100],
            labels = [];

        //https://codepen.io/haakseth/pen/KQbjdO
        div.innerHTML += "<h4>% Letalidad</h4>"


        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);


})