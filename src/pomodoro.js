"use strict"

module.exports = class Pomodoro {
  constructor(pomodoroTime, breakTime, slackBot) {
    this._pomodoroTime = pomodoroTime;
    this._breakTime = breakTime;
    this._slackBot = slackBot;
  }

  startPomodoro() {
    this._slackBot.post(`start pomodoro for ${this._pomodoroTime} min!`).catch(err => {
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
    this._slackBot.post(`Done! Let's have a break for ${this._breakTime}min!`).catch(err => {
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
    this._slackBot.post(`Your pomodoro session has done!`).catch(err => {
      return next(err);
    });

    // const client = getRedisClient;
    // client.set(redis_user_key, JSON.stringify(userPomodoro));
  }

};