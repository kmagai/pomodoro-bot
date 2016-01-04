"use strict"

module.exports = class Pomodoro {
  constructor(pomodoroTime, breakTime, slackBot) {
    this.pomodoroTime = pomodoroTime;
    this.breakTime = breakTime;
    this.slackBot = slackBot;
  }

  startPomodoro() {
    this.slackBot.post(`start pomodoro for ${this.pomodoroTime} min!`).catch(err => {
      return next(err);
    });

    let res, rej;
    var p = new Promise(function (resolve, reject) {
      res = resolve;
      rej = reject;
    });

    p._timeout = setTimeout(res, 2000);
    p.resetTimer = (err) => {
      rej(err || new Error("reset pomodoro"));
      console.log("reset pomodoro!");
      clearTimeout(p._timeout);
      return p;
    }
    return p;
  }

  startBreak() {
    this.slackBot.post(`Done! Let's have a break for ${this.breakTime}min!`).catch(err => {
      return next(err);
    });

    let res, rej;
    var p = new Promise(function (resolve, reject) {
      res = resolve;
      rej = reject;
    });

    p._timeout = setTimeout(res, 2000);
    p.resetTimer = (err) => {
      rej(err || new Error("reset pomodoro"));
      console.log("reset pomodoro!");
      clearTimeout(p._timeout);
      return p;
    }
    return p;
  }

  finishSession() {
    this.slackBot.post(`Your pomodoro session has done!`).catch(err => {
      return next(err);
    });

    // const client = getRedisClient;
    // client.set(redis_user_key, JSON.stringify(userPomodoro));
  }

};