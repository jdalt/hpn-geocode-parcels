var L = require('leaflet');
var request = require('superagent');
var map = L.map('map').setView([44.9833, -93.266730], 7);

if ( !String.prototype.contains ) {
  String.prototype.contains = function() {
    return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}

console.log('ohai');

L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
  key: 'BC9A493B41014CAABB98F0471D759707',
  styleId: 22677
}).addTo(map);

L.Icon.Default.imagePath = 'images';

var marketIcon = L.icon({
    iconUrl: 'images/market.png'
});

request.get('minnesota_grown.geojson').end(function(res) {
  if(res.text) {
    L.geoJson(JSON.parse(res.text), {
              onEachFeature: makePopups,
              pointToLayer: makeMarkers
    }).addTo(map);
  }
});

function makePopups(feature, layer) {
  console.log(feature);
  var props = feature.properties;
  if (props) {
    layer.bindPopup("<h3>" + props.name + "</h3><div class='italic'>" + props.products + "</div><div>" + props.description + "</div>");
  }
}

function makeMarkers(feature, latlng) {
  var props = feature.properties;
  var myIcon = null;
  var myColor = "#000";
  if (props) {
    var prod = props.products;
    if(prod.contains("Farmers Market")) {
      myColor = "#00f";
    }
    if(prod.contains("Cow") || prod.contains("Dairy")) {
      myColor = "#fff";
    }
    if(prod.contains("Pumpkin")) {
      myColor = "#ffa500";
    }
    if(prod.contains("CSA")) {
      myColor = "#0f0";
    }
    if(prod.contains("Wine")) {
      myColor = "#f00";
    }
    if(prod.contains("Beef")) {
      myColor = "#dedbef";
    }
  }
  return new L.circleMarker(latlng, {fillColor: myColor, fillOpacity: .8, stroke: false});
}

