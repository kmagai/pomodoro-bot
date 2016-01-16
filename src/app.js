"use strict"

let express = require('express');
let bodyParser = require('body-parser');

let app = express();
let port = process.env.PORT || 3000;

const url = require('url');
const User = require('./user');

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

  let user = User.getExisting(req.body.user_id);
  if(!user) user = User.create(req.body.user_id, req.body.user_name, req.body.channel_id);

  const matches = req.body.text.match(/^(\S+)(\s+)(\S+)=(\S+)|(\S+)$/);
  if(!matches) return res.status(200).send('send help message here!');
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
    // TODO: can acess non-existent key?
    // if (matches[3] && matches[4]) {
    // TODO: introduce Promise and handle error
    user.set_config_if_valid(matches[3], matches[4]);
    // }
    return res.status(200).send(trim
  `
    [Your pomodoro setting]
    Pomodoro time: ${user.pomodoro.pomodoro_time} min ['/pomodoro config pomodoro_time=N']
    Break time   : ${user.pomodoro.break_time} min ['/pomodoro config break_time=N']
    Silent mode  : ${user.pomodoro.is_silent}   ['/pomodoro config is_silent=yes', '/pomodoro config is_silent=no']
  `
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

function trim() {
  var raw = String.raw.apply(null, arguments)
  return raw.split('\n').map(s => s.trim()).join('\n').replace(/(^\n)|(\n$)/g, '')
}

