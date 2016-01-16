"use strict"

module.exports = class Pomodoro {
  constructor(pomodoro_time, break_time, is_silent) {
    // TODO: use them via accessor
    this.pomodoro_time = pomodoro_time;
    this.break_time = break_time;
    this.is_silent = is_silent;
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