"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const User = require('./user');
const constant = require('./constant');
const config = require('./config');

// body parser middleware
app.use(bodyParser.urlencoded({
  extended: true
}));

// test route
app.get('/', (req, res) => {
  res.status(200).send('Hello pomodoro users!')
});

app.post('/pomodoro', (req, res, next) => {
  if(!req.body.text) return res.status(200).send(constant.help_message);

  // TODO: validate req.body
  if(!req.body.user_id || !req.body.user_id || !req.body.channel_id) {
    return res.status(200).send(constant.help_message);
  }

  let user;
  const get_setting = User.get_setting({
    user_id: req.body.user_id,
    user_name: req.body.user_name,
    channel_id: req.body.channel_id,
    // TODO: do not pass res
  });

  get_setting.then((user_setting) => {
    console.log('user_setting');
    console.log(user_setting);
    console.log('user_setting');
    const user = User.create(user_setting);
    console.log('user');
    console.log(user);
    console.log('user');
    const matches_config = req.body.text.match(/^(\S+)(\s+)(\S+)=(\S+)$/);
    if(matches_config) {
      if(matches_config[1] == 'config') {
        // TODO: 一度タイマーを走らせるとリセットされる？開発環境のみ？
        // TODO: 本番環境でもアプリケーションを再起動(デプロイ)すると設定が消える
        const config_key = matches_config[3];
        const config_value = matches_config[4];
        
        if (user.is_config_valid(config_key, config_value)) {
          user.set_config(config_key, config_value);
          return res.status(200).send(`set ${config_key} to ${config_value}`);
        } else {
          return res.status(200).send(constant.help_message);
        }
      } else {
        console.log('here???');
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
      console.log(user);
      return res.status(200).send(setting_template(user));
    }
  }).catch((err) => {
    console.log(err);
  });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).send(err.message);
});

app.listen(port, () => {
  console.log('Slack bot listening on port ' + port);
});

function setting_template(user_setting) {
  return `
[Your pomodoro setting]
Pomodoro time: ${user_setting.pomodoro_time} min ['/pomodoro config pomodoro_time=N']
Break time   : ${user_setting.break_time} min ['/pomodoro config break_time=N']
`;
}