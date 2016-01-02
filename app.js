"use strict"

let express = require('express');
let bodyParser = require('body-parser');
let pomodoro = require('./pomodoro');

let app = express();
let port = process.env.PORT || 3000;

// body parser middleware
app.use(bodyParser.urlencoded({
  extended: true
}));

// test route
app.get('/', function (req, res) {
  res.status(200).send('Hello world!')
});

app.post('/pomodoro', pomodoro);

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

app.listen(port, function () {
  console.log('Slack bot listening on port ' + port);
});