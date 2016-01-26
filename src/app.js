"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const url = require('url');
const User = require('./user');
const constant = require('./constant');

// body parser middleware
app.use(bodyParser.urlencoded({
  extended: true
}));

// test route
app.get('/', (req, res) => {
  res.status(200).send('Hello world!')
});

function setting_template(pomodoro) {
  return trim `
  [Your pomodoro setting]
  Pomodoro time: ${pomodoro.pomodoro_time} min ['/pomodoro config pomodoro_time=N']
  Break time   : ${pomodoro.break_time} min ['/pomodoro config break_time=N']
  Silent mode  : ${pomodoro.is_silent}   ['/pomodoro config is_silent=yes', '/pomodoro config is_silent=no']`;
}

app.post('/pomodoro', (req, res, next) => {
  if(!req.body.text) return res.status(200).send(constant.help_message);

  let user = User.get_or_create({
    user_id: req.body.user_id,
    user_name: req.body.user_name,
    channel_id: req.body.channel_id,
    res: res,
  });
  console.log(user);

  const matches_config = req.body.text.match(/^(\S+)(\s+)(\S+)=(\S+)$/);
  if(matches_config) {
    if(matches_config[1] == 'config') {
      // TODO: introduce Promise and handle error
      user.set_config_if_valid(matches_config[3], matches_config[4]);
      return res.status(200).send(setting_template(user.pomodoro));
    } else {
      return res.status(200).send(constant.help_message);
    }
  }

  const matches = req.body.text.match(/^(\S+)$/);
  if(!matches) return res.status(200).send(constant.help_message);
  if(matches[1] == 'start') {
    user.start_timer();
    return res.status(200).end();
  } else if(matches[1] == 'reset') {
    user.reset_timer();
    return res.status(200).end();
  } else if(matches[1] == 'config') {
    return res.status(200).send(setting_template(user.get_config()));
  } else {
    return res.status(200).send(constant.help_message);
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