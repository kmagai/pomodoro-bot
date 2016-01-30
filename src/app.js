"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const User = require('./user');
const constant = require('./constant');

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

  let user = User.get_or_create({
    user_id: req.body.user_id,
    user_name: req.body.user_name,
    channel_id: req.body.channel_id,
    res: res,
  });

  const matches_config = req.body.text.match(/^(\S+)(\s+)(\S+)=(\S+)$/);
  if(matches_config) {
    if(matches_config[1] == 'config') {
      // TODO: configを設定した場合のみsilent modeが必ずundefinedになって表示される
      // TODO: 一度タイマーを走らせるとリセットされる？開発環境のみ？
      // TODO: 本番環境でもアプリケーションを再起動(デプロイ)すると設定が消える
      user.set_config_if_valid(matches_config[3], matches_config[4]);
      return res.status(200).send(setting_template(user.pomodoro));
    } else {
      return res.status(200).send(constant.help_message);
    }
  }

  const matches = req.body.text.match(/^(\S+)$/);
  if(!matches) return res.status(200).send(constant.help_message);
  if(matches[1] == 'start') {
    // TODO: 途中で接続切れたらどうすんの？
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

function setting_template(pomodoro) {
  return `
[Your pomodoro setting]
Pomodoro time: ${pomodoro.pomodoro_time} min ['/pomodoro config pomodoro_time=N']
Break time   : ${pomodoro.break_time} min ['/pomodoro config break_time=N']
`;
}