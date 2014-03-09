'use strict';

// TODO: delete me
if ( !String.prototype.contains ) {
  String.prototype.contains = function() {
    return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}

var angular = require('angular');
var _ = require('underscore');
var L = require('leaflet');
var request = require('superagent');

var app = angular.module('capitolCode', [])
.controller('mngrownCtrl', function($scope) {
  var map = L.map('map').setView([44.9833, -93.266730], 7);

  L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; 2014 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
    key: 'BC9A493B41014CAABB98F0471D759707',
    styleId: 22677
  }).addTo(map);
  L.Icon.Default.imagePath = 'images';

  var curPointLayer;
  request.get('minnesota_grown.geojson').end(function(res) {
    if(res.text) {
      curPointLayer = L.geoJson(JSON.parse(res.text), {
        onEachFeature: makePopups,
        pointToLayer: makeMarkers
      });
      curPointLayer.addTo(map);
    }
  });

  function makePopups(feature, layer) {
    console.log(feature);
    var props = feature.properties;
    if (props) {
      layer.bindPopup("<h3>" + props.name + "</h3><div class='italic'>" + props.products + "</div><div>" + props.description + "</div>");
    }
  }

  var markers = [];
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
    var marker = new L.circleMarker(latlng, {fillColor: myColor, fillOpacity: .8, stroke: false});
    marker.markerIndex = markers.length;
    markers.push(marker);
    console.log(markers);
    return marker;
  }
});
