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
.filter('productType', function() {
  return function(points, mapOptions) {
    var selectedTypes = [];
    for(var i=0; i<mapOptions.length; i++) {
      if(mapOptions[i].value === true) {
        selectedTypes.push(mapOptions[i].name);
      }
    }
    console.log(selectedTypes);
    var filteredPoints = [];
    points.forEach( function(element) {
      for(var i=0; i<selectedTypes.length; i++) {
        if(element.products.contains(selectedTypes[i])) {
          filteredPoints.push(element);
          break;
        }
      }
    });
    return filteredPoints;
  }
})
.controller('mngrownCtrl', function($scope, productTypeFilter) {
  var map = L.map('map').setView([44.9833, -93.266730], 7);
  $scope.mapOptions = [];

  L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; 2014 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
    key: 'BC9A493B41014CAABB98F0471D759707',
    styleId: 22677
  }).addTo(map);
  L.Icon.Default.imagePath = 'images';


  $scope.categoryList = {};
  request.get('categoryList.json').end(function(res) {
    console.log(res);
    if(res.text) {
      var sortCategories = JSON.parse(res.text);
      console.log("Sort Categories");
      console.log(sortCategories);
      var mapOptionList = {};
      _.each(sortCategories, function(list, categoryName) {
        console.log("Sort category: " + categoryName);
        mapOptionList[categoryName] = [];
        list.forEach( function(product) {
          mapOptionList[categoryName].push(addOption(product));
        });
      });
      console.log(mapOptionList);
      $scope.categoryList = mapOptionList;
    }
    getData();
  });

  var curPointLayer;
  function getData() {
    request.get('minnesota_grown.geojson').end(function(res) {
      if(res.text) {
        curPointLayer = L.geoJson(JSON.parse(res.text), {
          onEachFeature: makePopups,
          pointToLayer: makeMarkers
        });
        curPointLayer.addTo(map);
        $scope.$apply()
      }
    });
  }

  function makePopups(feature, layer) {
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
        myColor = "#444";
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
        myColor = "#787878";
      }
    }
    var marker = new L.circleMarker(latlng, {fillColor: myColor, fillOpacity: .8, stroke: false});
    marker.markerIndex = markers.length;
    marker.products = props.products;
    var products = props.products.split(",");
    markers.push(marker);
    return marker;
  }

  $scope.$watch('mapOptions', function() {
    console.log(curPointLayer);
    map.removeLayer(curPointLayer);
    curPointLayer = null;
    var filteredPoints = productTypeFilter(markers, $scope.mapOptions);
    curPointLayer = L.layerGroup(filteredPoints);
    curPointLayer.addTo(map);
  }, true);

  $scope.selectAll = function(list) {
    if(!list) {
      list = $scope.mapOptions;
    }
    list.forEach( function(item) {
      item.value = true;
    });
  };

  $scope.deselectAll = function(list) {
    if(!list) {
      list = $scope.mapOptions;
    }
    list.forEach( function(item) {
      item.value = false;
    });
  };

  $scope.reportOptions = function() {
    console.log(JSON.stringify($scope.mapOptions));
  };

  function addOption(item) {
    var item = {
      name: item,
      value: true
    };
    $scope.mapOptions.push(item);
    return item;
  }
});
