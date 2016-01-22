"use strict"

const redis = require('redis');

const Pomodoro = require('./pomodoro');
const SlackBot = require('./slack_bot');
const config = require('./config');

// TODO: save as module
const util = require('./util');
const redis_client = util.redis_client;

let user_pomodoros = {};
module.exports = class User {
  // constructor(user_id, user_name, channel_id, pomodoro, slack_bot) {
  constructor(options) {
    options = Object.assign(this._defaults(), options);
    this._user_id = options.user_id;
    this._user_name = options.user_name;
    this._channel_id = options.channel_id;
    this.pomodoro = options.pomodoro;
    this.slack_bot = options.slack_bot;
  }

  _defaults() {
    const user_config = this._get_or_default_config();
    return {
      pomodoro: this._create_pomodoro(user_config),
      slack_bot: this._create_slackbot(user_config)
    };
  }

  _create_pomodoro(user_config) {
    console.log(user_config);
    return Pomodoro.create(user_config)
  }

  _create_slackbot(user_config) {
    return SlackBot.create(user_config)
  }

  static get_or_create(options) {
    let user = this._getExisting(options.user_id);
    if(!user) {
      user = this._create(options.user_id, options.user_name, options.channel_id);
    }
    return user;
  }

  static _create(user_id, user_name, channel_id) {
    return new User({
      user_id: user_id,
      user_name: user_name,
      channel_id: channel_id
    });
  }

  static _getExisting(user_id) {
    this.pool = Object.assign({}, this.pool);
    if(this.pool[user_id]) {
      return this.pool[user_id];
    }
  }

  set_config_if_valid(key, value) {
    value = this._convert_value_if_needed(key, value);
    if(this._validate_config(key, value)) {
      this._set_config(key, value);
    };
  }

  _set_config(key, value) {
    const user_config = Object.assign(this._get_or_default_config(), {
      [key]: value
    });
    this.pomodoro[key] = value;
    redis_client.set(this._get_redis_key('config'), JSON.stringify(user_config));
  }

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

  _get_redis_key(target) {
    return `${target}:${this.user_id}`;
  }

  _validate_config(key, value) {
    if(key == undefined || value == undefined) throw new Error("You don't have enough argument");
    if(!config.user_config_type.has(key)) throw new Error('You specified non-existent config');
    return config.type_validator.get(config.user_config_type.get(key))(value);
  }

  _convert_value_if_needed(key, value) {
    if(config.user_config_type.get(key) == Boolean) {
      // TODO: separate validation with conversion
      if(config.bool_map.has(value)) {
        return config.bool_map.get(value);
      } else {
        throw new Error("You have a wrong value");
      }
    }
    return value;
  }

  get_config() {
    return this._get_or_default_config();
  }

  _get_or_default_config() {
    redis_client.get(this._get_redis_key('config'), function (err, data) {
      if(err) return console.log(err);
      if(data) return JSON.parse(data);
    });
    return config.user_config_default;
  }

  _slack_post(channel_id, message) {
    return this.slack_bot.post(channel_id, message);
  }

  _start_pomodoro() {
    const start_pomodoro = this.pomodoro.start_pomodoro();
    this._update_pomodoro_state(start_pomodoro);
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
    this._slack_post(this._channel_id, config.break_text);
  }

  _finish_break_time() {
    delete user_pomodoros[this._user_id];
    this._slack_post(this._channel_id, config.finish_text);
    this._add_completed_task();
    deferred.resolve();
  }

  start_timer() {
    if(user_pomodoros[this._user_id]) {
      console.log('ERROR: You already have a pomodoro session');
      this._slack_post(this._channel_id, 'you have a pomodoro session already')
    }

    // TODO: そもそもpomodorosはインスタンスに割り当てるべき？それともSingletonにして振り回すべき？
    this._update_pomodoro_state(this.pomodoro);
    const deferred = Promise.defer();
    this._slack_post(this._channel_id, config.start_text);

    this._start_pomodoro().then(() => {
      this._finish_pomodoro_time();
      this._start_break().then(() => {
        this._finish_break_time();
      })
    }).catch(err => {
      deferred.reject(err);
      // TODO: request
      return res.status(200).end();
    })

    return deferred.promise;
  }

  reset_timer() {
    if(!user_pomodoros[this._user_id]) {
      console.log('ERROR: You have no pomodoro session');
      return;
    }
    console.log("reset pomodoro");
    user_pomodoros[this._user_id].reset_timer();
    delete user_pomodoros[this._user_id];
    console.log("done");
  }

}