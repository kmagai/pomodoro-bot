"use strict"

const redis = require('redis');

const Pomodoro = require('./pomodoro');
const slackBot = require('./slack_bot');
const config = require('./config.js')
const client = getRedisClient();

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


let user_pomodoros = {};
module.exports = class User {
  constructor(user_id, user_name, channel_id, pomodoro, slack_bot) {
    this._user_id = user_id;
    this._user_name = user_name;
    this._channel_id = channel_id;
    this.pomodoro = pomodoro;
    this.slack_bot = slack_bot;
  }
  
  static getOrCreate(user_id, user_name, channel_id) {
    let user = this._getExisting(user_id);
    if (!user) {
      user = this._create(user_id, user_name, channel_id);
    }
    return user;
  }

  static _create(user_id, user_name, channel_id) {
    const user = new User(user_id, user_name, channel_id);
    const user_config = user._get_or_default_config();
    user.pomodoro = new Pomodoro(user_config.pomodoro_time, user_config.break_time, user_config.is_silent);
    user.slack_bot = slackBot;
    return user;
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
    client.set(this._get_redis_key('config'), JSON.stringify(user_config));
  }

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
      if(config.bool_map.has(value)) {
        return config.bool_map.get(value);
      } else {
        throw new Error("You have a wrong value");
      }
    }
    return value;
  }

  _get_or_default_config() {
    client.get(this._get_redis_key('config'), function (err, data) {
      if(err) return console.log(err);
      if(data) return JSON.parse(data);
    });
    return config.user_config_default;
  }

  startTimer() {
    if(user_pomodoros[this._user_id]) {
      // notify via bot
      console.log('ERROR: You already have a pomodoro session');
      this.slack_bot.post('you have a pomodoro session already').then(() => {
        deferred.resolve();
        return deferred.promise;
      }).catch(() => {
        deferred.reject(err);
        return res.status(200).end();
      });
    }

    // const user_pomodoro = {this._user_id: this._pomodoro};
    Object.assign(user_pomodoros, {
      [this._user_id]: this.pomodoro
    });

    const deferred = Promise.defer();
    const break_text = `start break for ${this.pomodoro.break_time} min!`;
    const start_text = `start pomodoro for ${this.pomodoro.pomodoro_time} min!`;
    const finish_text = `your pomodoro session has finished!`;

    this.slack_bot.post(this._channel_id, start_text).then(() => {
      console.log("pomodoro started");
      const start_pomodoro = this.pomodoro.startPomodoro();
      Object.assign(user_pomodoros, {
        [this._user_id]: start_pomodoro
      });
      start_pomodoro.then(() => {
        console.log("pomodoro done");
        this.slack_bot.post(this._channel_id, break_text).then(() => {
          console.log("break started");
          const start_break = this.pomodoro.startBreak();
          Object.assign(user_pomodoros, {
            [this._user_id]: start_break
          });
          start_break.then(() => {
            console.log("break done");
            delete user_pomodoros[this._user_id];
            this.slack_bot.post(this._channel_id, finish_text).then(() => {
              console.log("done");
              deferred.resolve();
            })
          })
        })
      }).catch(err => {
        deferred.reject(err);
        // ??
        return res.status(200).end();
      })
    });


    return deferred.promise;
  }

  resetTimer() {
    if(!user_pomodoros[this._user_id]) {
      console.log('ERROR: You have no pomodoro session');
      return;
    }
    console.log("reset pomodoro");
    user_pomodoros[this._user_id].resetTimer();
    delete user_pomodoros[this._user_id];
    console.log("done");
  }

}