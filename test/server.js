var express = require('express');

var app = express();
var port = 6789;

exports.url = 'http://localhost:' + port;

app.all('*', function(req, res) {
  res.json([]);
});

app.listen(port);
