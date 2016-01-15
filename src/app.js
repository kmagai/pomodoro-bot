"use strict"

let express = require('express');
let bodyParser = require('body-parser');

let app = express();
let port = process.env.PORT || 3000;

const redis = require('redis');
const url = require('url');
const UserFactory = require('./user_factory');
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

  let config = {
    pomodoro_time: 25,
    break_time: 25,
    is_silent: true
  };

  const bool_map = {
    y: true,
    yes: true,
    1: true,
    n: false,
    no: false,
    0: false
  }

  const pomodoro = new Pomodoro(config.pomodoro_time, config.break_time);
  const user = UserFactory.get(req.body.user_id, req.body.user_name, req.body.channel_id, pomodoro, slackBot);

  const matches = req.body.text.match(/^(\S+)(\s+)(\S+)=(\S+)|(\S+)$/);
  if(!matches) return res.status(200).send('send help message here!');
  console.log(matches);
  if(matches[1] == 'start') {
    user.startTimer().then(() => {
      res.status(200).end();
    }).catch((err) => {
      next(err);
    });
  } else if(matches[1] == 'reset') {
    user.resetTimer();
    res.status(200).end();
  } else if(matches[1] == 'config') {
    console.log(matches[3]);
    // TODO: check if it works even on false Bool
    if(config[matches[3]]) {
      // TODO: varidate num or bool
      if(matches[4]) {
        if(matches[3] == 'is_silent') {
          config[matches[3]] = bool_map[matches[4]];
        } else {
          config[matches[3]] = matches[4];
        }
      } else {
        return res.status(200).send('send help message here!');
      }
    } else {
      return res.status(200).send('You specified non-existent config.');
    }
    return res.status(200).send(
      `[Your pomodoro setting]
Pomodoro time: ${config.pomodoro_time} min ['/pomodoro config pomodoro_time=N']
Break time   : ${config.break_time} min ['/pomodoro config break_time=N']
Silent mode  : ${config.is_silent}   ['/pomodoro config is_silent=yes', '/pomodoro config is_silent=no']`
    );
  } else {
    res.status(200).send('send help message here!');
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