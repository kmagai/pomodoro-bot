// Commands:
//   /pomodoro start [pomodoro time] [break time] - start a new pomodoro. default to 25 min pomodoro, 5 min break
//   /pomodoro status - show pomodoro status. total today, total this week, current session, and etc
//   /pomodoro help - show available commands

"use strict"
const request = require('request');
const redis = require('redis');
const url = require('url');

class User {
  constructor(user_id, user_name, pomodoro) {
    this.user_id = user_id;
    this.user_name = user_name;
    this.pomodoro = pomodoro;
  }

  startTimer() {
    // const redis_user_key = `user_id:${this.user.user_id}`;
    // const client = getRedisClient();

    // let userPomodoro = {};
    // client.get(redis_user_key, function (err, data) {
    //   if (data) {
    //     userPomodoro = JSON.parse(data);
    //   }
    // });

    // return this.pomodoro.startPomodoro().then(this.pomodoro.startBreak());
    const deferred = Promise.defer();

    this.pomodoro.startPomodoro().then(() => {
      this.pomodoro.startBreak().then(() => {
        this.pomodoro.finishSession().then(() => {
          deferred.resolve();
        })
      })
    }).catch(err => {
      deferred.reject(err);
    });
    
    return deferred.promise;
  }
}

class SlackBot {
  constructor(bot_name, channel_id, icon_emoji) {
    this.bot_name = bot_name;
    this.channel_id = channel_id;
    this.icon_emoji = icon_emoji;
  }

  post(text) {
    const path = process.env.INCOMING_WEBHOOK_PATH;
    const uri = 'https://hooks.slack.com/services' + path;
    const deferred = Promise.defer();

    const bot = {
      text: text,
      username: this.bot_name,
      channel: this.channel_id,
      icon_emoji: this.icon_emoji,
    }

    request({
      uri: uri,
      method: 'POST',
      body: JSON.stringify(bot)
    }, function (error, response, body) {
      if(error) {
        deferred.reject(error);
      } else if(response.statusCode !== 200) {
        deferred.reject(new Error('Incoming WebHook: ' + response.statusCode + ' ' + body));
      }
      deferred.resolve(body);
    });

    return deferred.promise;
  }
}

class Pomodoro {
  constructor(pomodoroTime, breakTime, slackBot) {
    this.pomodoroTime = pomodoroTime;
    this.breakTime = breakTime;
    this.slackBot = slackBot;
  }

  startPomodoro() {
    this.slackBot.post(`start pomodoro for ${this.pomodoroTime} min!`).catch(function (error) {
      return next(error);
    });

    return new Promise(function (resolve, reject) {
      // setTimeout(resolve, pomodoroTime * 60 * 1000);
      setTimeout(resolve, 2000);
    });
  }

  startBreak() {
    this.slackBot.post(`Done! Let's have a break for ${this.breakTime}min!`).catch(function (error) {
      return next(error);
    });

    return new Promise(function (resolve, reject) {
      // setTimeout(resolve, breakTime * 60 * 1000);
      setTimeout(resolve, 2000);
    });
  }

  finishSession() {
    this.slackBot.post(`Your pomodoro session has done!`).catch(function (error) {
      return next(error);
    });

    // const client = getRedisClient;
    // client.set(redis_user_key, JSON.stringify(userPomodoro));
  }

};

module.exports = function (req, res, next) {
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
}

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