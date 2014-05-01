var express = require('express');

var app = express();
var port = 6789;

exports.url = 'http://localhost:' + port;

app.get('/404', function(req, res) {
  res.send(404);
});

app.get('/', function(req, res) {
  res.json([]);
});

app.listen(port);
