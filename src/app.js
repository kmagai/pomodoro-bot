"use strict"

let express = require('express');
let bodyParser = require('body-parser');

let app = express();
let port = process.env.PORT || 3000;

const redis = require('redis');
const url = require('url');
const UserFactory = require('./user');
// TODO: slackBot is a singleton object here. Importing like a class looks weird.
const slackBot = require('./slack_bot');
const Pomodoro = require('./pomodoro');

// body parser middleware
app.use(bodyParser.urlencoded({
  extended: true
}));

// test route
app.get('/', (req, res) => {
  res.status(200).send('Hello world!')
});

app.post('/pomodoro', (req, res, next) => {
  if(!req.body.text) {
    return res.status(200).send('/pomodoro start <duration>');
  }

  const matches = req.body.text.match(/^(\S+)(\s+)(\d+)(\s+)(\d+)$/);
  if(matches && matches[1] == 'start') {
    // if(user.currentPomodoro) {
    //   return;
    //   // const user = new User(req.body.user_id, req.body.user_name, currentPomodoro);
    // }

    let pomodoro_time = 25;
    let break_time = 25;
    if(matches[3] && matches[5]) {
      pomodoro_time = matches[3];
      break_time = matches[5];
    }

    const pomodoro = new Pomodoro(pomodoro_time, break_time);
    const user = UserFactory.get(req.body.user_id, req.body.user_name, req.body.channel_id, pomodoro, slackBot);
    
    user.startTimer().then(() => {
      res.status(200).end();
    }).catch((err) => {
      next(err);
    });
  }
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).send(err.message);
});

app.listen(port, () => {
  console.log('Slack bot listening on port ' + port);
});

function getRedisClient() {
  if(process.env.REDISTOGO_URL) {
    var rtg = url.parse(process.env.REDISTOGO_URL);
    var client = redis.createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(":")[1]);
    return client;
  } else {
    return redis.createClient();
  }
}