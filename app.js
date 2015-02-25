'use strict';

var angular = require('angular');
var _ = require('underscore');
var L = require('leaflet');
var request = require('superagent');
var Q = require('q');

var app = angular.module('hpnGeoCode', [])
.controller('hpnGeoCtrl', function($scope) {
  var map = L.map('map').setView([45.16340030196438, -93.58283042907715], 13);
  $scope.mapOptions = [];

  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; 2014 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
    key: 'BC9A493B41014CAABB98F0471D759707',
    styleId: 22677
  }).addTo(map);
  L.Icon.Default.imagePath = 'images';

  $scope.animate = function() {
    $scope.mapTime = 0;
    var intervalKey = setInterval(function() {
      $scope.mapTime += .005;
      $scope.$apply();
      if($scope.mapTime >= 1) {
        clearInterval(intervalKey);
        $scope.mapTime = 1;
      }
    }, 25);
  }

  $scope.mapTime = 0;
  function startTheWatch() {
    $scope.$watch('mapTime', function() {
      interpolateParcelColor($scope.mapTime);
    }, true);
  }

  function interpolateParcelColor(mag) {
    parcelGeometry.eachLayer(function(parcel) {
      var pin = parcel.feature.properties.PIN;
      var estVal = estimatedValue(pin, $scope.parcelKey, mag);
      var relVal = relativeValue(estVal);
      var color = magToColor(relVal);
      parcel.setStyle({fillColor: color});
    });
  }

  $scope.currentValue = function(pin) {
    return estimatedValue(pin, $scope.parcelKey, $scope.mapTime);
  }

  function magToColor(mag) {
    if(mag > 1 ) mag = 1;
    if(mag < 0 ) mag = 0;
    var c = Math.floor(255 * mag)
    return "rgb(" + c + "," + c + "," + c + ")";
  }

  var SMALLEST_VALUE = 0;
  var LARGEST_VALUE = 3000000;
  function relativeValue(val) {
    return val / LARGEST_VALUE;
  }

  function estimatedValue(pin, valKey, mag) {
    if(!featProps[2011][pin] || !featProps[2002][pin]) {
      return 0;
    }
    if(!featProps[2011][pin][valKey] || !featProps[2002][pin][valKey]) {
      return 0;
    }
    return (featProps[2011][pin][valKey] - featProps[2002][pin][valKey]) * mag + featProps[2002][pin][valKey]
  }

  $scope.logMap = function() {
    console.log(map.getCenter());
    console.log(map.getZoom());
    var bnd = map.getBounds();

    function g(bnd) {
      return [bnd.lng, bnd.lat];
    }
    var poly = [[
      g(bnd.getNorthWest()),
      g(bnd.getNorthEast()),
      g(bnd.getSouthEast()),
      g(bnd.getSouthWest()),
      g(bnd.getNorthWest())
    ]]
    console.log(JSON.stringify(poly));
    getGeoData(poly).then(getProps).then(startTheWatch).then(function(){ interpolateParcelColor(0.0);});
  }

  function createLayer(feature, layer) {
    var props = feature.properties;
    if (props) {
      layer.on('click', function(e) {
        $scope.curParcelProps = featProps[2011][e.target.feature.properties.PIN];
        $scope.$apply();
      });
    }
    layer.setStyle({fillOpacity: .8, color: "#000", weight: 1});
  }

  var parcelGeometry;
  function getGeoData(coords) {
    var deferred = Q.defer();
    request.get('/geo/' + JSON.stringify(coords)).end(function(err, res) {
      if(err || !res.text) {
        deferred.reject(new Error(err));
      } else {
        parcelGeometry = L.geoJson(JSON.parse(res.text), {
          onEachFeature: createLayer
        });
        parcelGeometry.addTo(map);
        $scope.$apply();
        deferred.resolve(parcelGeometry.getLayers());
      }
    });
    return deferred.promise;
  }

  var featProps = {};
  function getProps(parcelLayers) {
    var deferred = Q.defer();
    var pins = _.map(parcelLayers, function(parcel) {
      return parcel.feature.properties.PIN;
    });
    request.get('/props/' + JSON.stringify(pins)).end(function(err, res) {
      if(err || !res.text) {
        deferred.reject(new Error(err));
      } else {
        var propArray = JSON.parse(res.text);
        featProps[2011] = {};
        _.each(propArray, function(prop) {
          featProps[2011][prop._id] = prop;
        });
        deferred.resolve(featProps[2011]);
      }
    });
    return deferred.promise;
  }

});
