var express = require('express');
var app = new express();

app.use(express.json());

app.use(express.static(__dirname + '/public'));

app.listen(3000);
