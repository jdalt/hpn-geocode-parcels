var express = require('express');
var monk = require('monk');
var db =  monk('localhost:27017/hpn_geo');
var app = new express();
var bodyParser = require('body-parser')
app.use(bodyParser.json())

app.use(express.json());

app.use(express.static(__dirname + '/public'));

app.get('/geo/:coords', function (req, res) {
  console.log(req.params.coords);
  var collection = db.get('geometry');
  collection.find({'properties.centroid': { '$geoWithin': { '$geometry' :
                  { 'type' : "Polygon",
                    coordinates: JSON.parse(req.params.coords)
  }}}}, function(err,docs){
    if(err) {
      console.log(err);
      res.json({error: err});
    } else {
      console.log(docs.length);
      res.json(docs);
    }
  });
});

app.get('/props/:ids', function (req, res) {
  console.log(req.params.ids);
  var collection = db.get('properties');
  collection.find({'_id': { '$in': JSON.parse(req.params.ids) }}, function(err,docs){
    if(err) {
      console.log(err);
      res.json({error: err});
    } else {
      console.log(docs.length);
      res.json(docs);
    }
  });
});

var port = Number(process.env.PORT || 3000);
app.listen(port);
