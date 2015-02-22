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

  var parcelGeometry;
  function getGeometryData() {
    var deferred = Q.defer();
    request.get('hpn2011.geojson').end(function(err, res) {
      if(err || !res.text) {
        deferred.reject(new Error(err));
      } else {
        parcelGeometry = L.geoJson(JSON.parse(res.text), {
          onEachFeature: makePopups
        });
        parcelGeometry.addTo(map);
        $scope.$apply();
        deferred.resolve();
      }
    });
    return deferred.promise;
  }

  var featProps = {};
  function getYearProps(year) {
    var deferred = Q.defer();
    request.get('hpn' + year + '.geojson').end(function(err, res) {
      if(err || !res.text) {
        deferred.reject(new Error(err));
      } else {
        var rawGeo = JSON.parse(res.text);
        featProps[year] = {};
        _.each(rawGeo.features, function(item) {
          featProps[year][item.properties.PIN] = item.properties;
        });
        deferred.resolve();
      }
    });
    return deferred.promise;
  }

  function makePopups(feature, layer) {
    var props = feature.properties;
    if (props) {
      layer.on('click', function(e) {
        $scope.curParcelProps = e.target.feature.properties;
        $scope.$apply();
      });
    }
    layer.setStyle({fillOpacity: .8, color: "#000", weight: 1});
  }

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
  getGeometryData().then(function() { getYearProps(2011); }).then(function() { getYearProps(2002); }).then(startTheWatch).then(function(){ interpolateParcelColor(0.0);});

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
  }

});
