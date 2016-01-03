"use strict"

let express = require('express');
let bodyParser = require('body-parser');

let app = express();
let port = process.env.PORT || 3000;

const redis = require('redis');
const url = require('url');
const User = require('./user');
const SlackBot = require('./slack_bot');
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

    let pomodoroTime = 25;
    let breakTime = 25;
    if(matches[3] && matches[5]) {
      pomodoroTime = matches[3];
      breakTime = matches[5];
    }

    const slackBot = new SlackBot('pomodoro', req.body.channel_id, ':tomato:');
    const pomodoro = new Pomodoro(pomodoroTime, breakTime, slackBot);
    const user = new User(req.body.user_id, req.body.user_name, pomodoro);

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