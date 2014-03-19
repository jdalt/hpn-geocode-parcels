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
    // TODO: make this a separate filter that feeds into this one, or change to
    // map.
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
.filter('pointOptions', function() {
  return function(mapOptions, point) {
    var validOptions = [];
    mapOptions.forEach( function(option) {
      if(point.products.contains(option.name)) {
        validOptions.push(option);
      }
    });
    return validOptions;
  }
})
.controller('mngrownCtrl', function($scope, productTypeFilter, pointOptionsFilter) {
  var map = L.map('map').setView([44.9833, -93.266730], 7);
  $scope.mapOptions = [];

  L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; 2014 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
    key: 'BC9A493B41014CAABB98F0471D759707',
    styleId: 22677
  }).addTo(map);
  L.Icon.Default.imagePath = 'images';

  // // TODO: make not suck; doesn't work with angular...
  // var info = L.control();
  // info.onAdd = function (map) {
  //   this._div = L.DomUtil.create('div', 'stuff'); 
  //   this._div.innerHTML = '<button class="btn-mini btn-success" ng-click="selectAll()">Select All</button><button class="btn-mini btn-inverse" ng-click="deselectAll()">Deselect All</button>';
  //   return this._div;
  // };
  // info.addTo(map);

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
    _.each($scope.mapOptions, function(option, idx) {
      option.colorPower = getHexSequence(idx);
      option.color = getPaddedHex(option.colorPower);
    });
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
    var cats = pointOptionsFilter($scope.mapOptions, props);
    // TODO: build colors at the category level
    var myColor = buildColor(cats);
    var marker = new L.circleMarker(latlng, {fillColor: myColor, fillOpacity: .7, stroke: false});
    marker.markerIndex = markers.length;
    marker.products = props.products;
    marker.baseColor = myColor;
    var products = props.products.split(",");
    markers.push(marker);
    return marker;
  }

  function buildColor(options) {
    var colorValue = 0;
    options.forEach( function(option) {
      colorValue = colorValue | Math.pow(2, option.colorPower);
    });
    return getHexPadded(colorValue);
  }

  $scope.$watch('mapOptions', function() {
    $scope.filterMap($scope.mapOptions);
  }, true);

  $scope.filterMap = function(options) {
    console.log(curPointLayer);
    map.removeLayer(curPointLayer);
    curPointLayer = null;
    var filteredPoints = productTypeFilter(markers, options);
    curPointLayer = L.layerGroup(filteredPoints);
    curPointLayer.addTo(map);
  }

  $scope.highlightMapOption = function(option) {
    console.log("option!!! :" + option);
    // TODO: use filter that doesn't filter by true false on value else click
    // will lock color. Ideally change productTypeFilter to accept already
    // fitlered options (create a filter to feed that if needed).
    var filteredPoints = productTypeFilter(markers, [option]);
    filteredPoints.forEach( function(point) {
      point.setStyle({ fillColor: "yellow", fillOpacity: 1.0});
      point.bringToFront();
    });
  }

  $scope.clearHighlight = function(option) {
    console.log("option!!! :" + option);
    var filteredPoints = productTypeFilter(markers, [option]);
    filteredPoints.forEach( function(point) {
      point.setStyle({ fillColor: point.baseColor, fillOpacity: .7});
    });
  }

  function getHexSequence(i) {
    var pow = (i) % 24;
    var pow2 = (i) % 48;
    if(pow != pow2) {
      pow = 23 - pow;
    }
    return pow;
  }

  function getHexPadded(intValue) {
    var nakedHex = intValue.toString(16);
    var padding = 6 - nakedHex.length;
    var pad = "";
    _.times(padding, function() { pad = pad + "0"; });
    return "#" + pad + nakedHex;
  }

  function getPaddedHex(pow) {
    var nakedHex = Math.pow(2,pow).toString(16);
    var padding = 6 - nakedHex.length;
    var pad = "";
    _.times(padding, function() { pad = pad + "0"; });
    return "#" + pad + nakedHex;
  }

  $scope.getColor = function(obj) {
    return {
      backgroundColor: obj.color
    }
  };


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
