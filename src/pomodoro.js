"use strict"

module.exports = class Pomodoro {
  constructor(pomodoro_time, break_time, is_silent) {
    // TODO: use them via accessor
    this.pomodoro_time = pomodoro_time;
    this.break_time = break_time;
    this.is_silent = is_silent;
  }

  getPomodoro() {
    client.get(user.get_redis_key('config'), function (err, data) {
      if(err) return console.log(err);
      if(data) {
        this.user_config = JSON.parse(data);
      }
    });
    return new Pomodoro(user_config.pomodoro_time, user_config.pomodoro);
  }

  startPomodoro() {
    let res, rej;
    var p = new Promise(function (resolve, reject) {
      res = resolve;
      rej = reject;
    });

    p._timeout = setTimeout(res, this.pomodoro_time * 1000 * 60);
    // p._timeout = setTimeout(res, 2000);
    p.resetTimer = (err) => {
      rej(err || new Error("reset pomodoro"));
      console.log("reset pomodoro!");
      clearTimeout(p._timeout);
      return p;
    }
    return p;
  }

  startBreak() {
    let res, rej;
    var p = new Promise(function (resolve, reject) {
      res = resolve;
      rej = reject;
    });

    p._timeout = setTimeout(res, this.break_time * 1000 * 60);
    // p._timeout = setTimeout(res, 2000);
    p.resetTimer = (err) => {
      rej(err || new Error("reset pomodoro"));
      console.log("reset pomodoro!");
      clearTimeout(p._timeout);
      return p;
    }
    return p;
  }

};