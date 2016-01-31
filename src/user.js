"use strict"

const redis = require('redis');
const Pomodoro = require('./pomodoro');
const SlackBot = require('./slack_bot');
const config = require('./config');
const util = require('./util');
const constant = require('./constant');

const redis_client = util.redis_client;

let user_pomodoros = {};
module.exports = class User {
  constructor(options) {
    console.log('------options-------');
    console.log(options);
    console.log('------options-------');
    this._user_id = options.user_id;
    this._user_name = options.user_name;
    this._channel_id = options.channel_id;

    this.pomodoro = options.pomodoro;
    this.slack_bot = options.slack_bot;
    this.res = options.res;

    // pomodoroの設定をpomodoroに渡してpomodoroをインスタンス化
    this.pomodoro_time = options.pomodoro_time;
    this.break_time = options.break_time;
  }

  static get_setting(options) {
    const deferred = Promise.defer();
    User._get_or_default_config().then((user_config) => {
      const pomodoro = this._create_pomodoro(user_config);
      const bot = this._create_slackbot(user_config);
      const setting = Object.assign({
        pomodoro_time: user_config.pomodoro_time,
        break_time: user_config.break_time,
        pomodoro: this._create_pomodoro(user_config),
        slack_bot: this._create_slackbot(user_config),
      }, options);
      console.log('options ----------------');
      console.log(options);
      console.log('options ----------------');

      console.log('setting ----------------');
      console.log(setting);
      console.log('setting ----------------');

      return deferred.resolve(setting);
    }).catch((err) => {
      console.log(err);
    });
    return deferred.promise;
  }

  static _create_pomodoro(user_config) {
    console.log(user_config);
    return Pomodoro.create(user_config)
  }

  static _create_slackbot(user_config) {
    return SlackBot.create(user_config)
  }

  static create(options) {
    return new User(options);
  }

  is_config_valid(key, value) {
    value = this._convert_value_if_needed(key, value);
    return this.validate_config(key, value);
  }

  set_config(key, value) {
    User._get_or_default_config().then((current_config) => {
      const user_config = Object.assign(current_config, {
        [key]: value
      });
      return redis_client.set(User._get_redis_key('config'), JSON.stringify(user_config));
    }).catch(err => {
      console.log(err);
    })
  }

  // set_config_if_valid(key, value) {
  //   const deferred = Promise.defer();
  //   value = this._convert_value_if_needed(key, value);
  //   if(this.validate_config(key, value)) {
  //     this.set_config(key, value).then(() => {
  //       console.log('resolved!!!!!!!!');
  //       return deferred.resolve();
  //     });
  //   } else {
  //     console.log('not resolved!!!!!!!!');
  //     return deferred.resolve();
  //   }
  //   console.log('promised!!!!!');
  //   return deferred.promise;
  // }


  // _add_completed_task() {
  //   const completed_today = this._get_completed_task(this._today()) + 1;
  //   console.log(completed_today);
  //   client.hset(this._get_redis_key('completed'), this._today(), completed_today);
  //   let today_a = this._get_completed_task(this._today());
  //   console.log(today_a);
  // }
  //
  // _get_completed_task(from) {
  //   client.zrange(this._get_redis_key('completed'), function (err, data) {
  //     if(err) console.log(err);
  //     if(data) return JSON.parse(data);
  //   });
  //   return 0;
  // }
  //
  // _today() {
  //   return (new Date()).toISOString().slice(0,10).replace(/-/g,"")
  // }

  static _get_redis_key(target) {
    return `${target}:${this.user_id}`;
  }

  validate_config(key, value) {
    console.log('hoge');
    if(key == undefined || value == undefined) next(new Error("You don't have enough argument"));
    if(!config.config_type_map.has(key)) next(new Error('You specified non-existent config'));
    let validator = this._get_validator(config.config_type_map.get(key))
    console.log(validator);
    return validator(value);
  }

  _get_validator(type) {
    return config.type_validator_map.get(type);
  }

  _convert_value_if_needed(key, value) {
    if(config.config_type_map.get(key) == Boolean) {
      // TODO: separate validation with conversion
      if(config.bool_map.has(value)) {
        return config.bool_map.get(value);
      } else {
        throw new Error("You have a wrong value");
      }
    }
    return value;
  }

  static _get_or_default_config() {
    const deferred = Promise.defer();

    redis_client.get(User._get_redis_key('config'), function (err, data) {
      if(err) return deferred.reject(err);
      if(data) {
        console.log("---configfound-----");
        console.log(data);
        console.log("---configfound-----");
        return deferred.resolve(Object.assign(config.user_config_default, JSON.parse(data)));
      }
      return deferred.resolve(config.user_config_default);
    });
    return deferred.promise;
  }

  _slack_post(channel_id, message) {
    return this.slack_bot.post(this.res, channel_id, message);
  }

  _start_pomodoro() {
    const start_pomodoro = this.pomodoro.start_pomodoro();
    this._update_pomodoro_state(start_pomodoro);
    console.log(start_pomodoro);
    return start_pomodoro;
  }

  _start_break() {
    const break_pomodoro = this.pomodoro.start_break();
    this._update_pomodoro_state(break_pomodoro);
    return break_pomodoro;
  }

  _break_duration() {
    return this.pomodoro.break_time;
  }

  _pomodoro_duration() {
    return this.pomodoro.pomodoro_time;
  }

  _update_pomodoro_state(pomodoro) {
    Object.assign(user_pomodoros, {
      [this._user_id]: pomodoro
    });
  }

  _finish_pomodoro_time() {
    this._slack_post(this._channel_id, `start break for ${this._break_duration()} min!`);
  }

  _finish_break_time() {
    delete user_pomodoros[this._user_id];
    this._slack_post(this._channel_id, `your pomodoro session has finished!`);
    this._add_completed_task();
  }

  start_timer() {
    if(user_pomodoros[this._user_id]) {
      console.log('ERROR: You already have a pomodoro session');
      return this._slack_post(this._channel_id, 'you have a pomodoro session already');
    }

    // TODO: そもそもpomodorosはインスタンスに割り当てるべき？それともSingletonにして振り回すべき？
    this._update_pomodoro_state(this.pomodoro);
    const deferred = Promise.defer();
    this._slack_post(this._channel_id, `start pomodoro for ${this._pomodoro_duration()} min!`);

    this._start_pomodoro().then(() => {
      this._finish_pomodoro_time();
      this._start_break().then(() => {
        this._finish_break_time();
        deferred.resolve();
      })
    }).catch(err => {
      deferred.reject(err);
    })

    return deferred.promise;
  }

  reset_timer() {
    if(!user_pomodoros[this._user_id]) {
      console.log('ERROR: You have no pomodoro session');
      return this._slack_post(this._channel_id, `ERROR: You have no pomodoro session`);
    }
    console.log("reset pomodoro");
    console.log(user_pomodoros);
    console.log(user_pomodoros[this._user_id]);
    this._slack_post(this._channel_id, `Your pomodoro session has cancelled`);
    delete user_pomodoros[this._user_id];
    user_pomodoros[this._user_id].reset_timer();
    console.log("done");
  }

}