var express = require('express');
var app = new express();

app.use(express.json());

app.use(express.static(__dirname + '/public'));

var port = Number(process.env.PORT || 5000);
app.listen(port);
