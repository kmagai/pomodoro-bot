"use strict"
const config = require('./config.js')

module.exports = class Pomodoro {
  constructor(pomodoro_time, break_time) {
    this.pomodoro_time = pomodoro_time;
    this.break_time = break_time;
  }
  
  static create(config) {
    Object.assign(this._get_default_config(), config);
    return new Pomodoro(config.pomodoro_time, config.break_time);
  }
  
  static _get_default_config() {
    return config.pomodoro_default_config;
  }

  // get_pomodoro() {
  //   client.get(user.get_redis_key('config'), function (err, data) {
  //     if(err) return console.log(err);
  //     if(data) {
  //       this.user_config = JSON.parse(data);
  //     }
  //   });
  //   return new Pomodoro(user_config.pomodoro_time, user_config.pomodoro);
  // }

  start_pomodoro() {
    let res, rej;
    var p = new Promise(function (resolve, reject) {
      res = resolve;
      rej = reject;
    });

    p._timeout = setTimeout(res, this.pomodoro_time * 1000 * 60);
    // p._timeout = setTimeout(res, 2000);
    p.reset_timer = (err) => {
      rej(err || new Error("reset pomodoro"));
      console.log("reset pomodoro!");
      clearTimeout(p._timeout);
      return p;
    }
    return p;
  }

  start_break() {
    let res, rej;
    var p = new Promise(function (resolve, reject) {
      res = resolve;
      rej = reject;
    });

    p._timeout = setTimeout(res, this.break_time * 1000 * 60);
    // p._timeout = setTimeout(res, 2000);
    p.reset_timer = (err) => {
      rej(err || new Error("reset pomodoro"));
      console.log("reset pomodoro!");
      clearTimeout(p._timeout);
      return p;
    }
    return p;
  }

};