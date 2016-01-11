"use strict"

let user_pomodoros = {};
class User {
  constructor(user_id, user_name, channel_id, pomodoro, slack_bot) {
    this._user_id = user_id;
    this._user_name = user_name;
    this._channel_id = channel_id;
    this._pomodoro = pomodoro;
    this._slack_bot = slack_bot;
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

    if(user_pomodoros[this._user_id]) {
      // notify via bot
      console.log('ERROR: you have a session');
      this._slack_bot.post('you have a pomodoro session already').then(() => {
        deferred.resolve();
        return deferred.promise;
      }).catch(() => {
        deferred.reject(err);
        return res.status(200).end();
      });
    }

    // const user_pomodoro = {this._user_id: this._pomodoro};
    Object.assign(user_pomodoros, {
      [this._user_id]: this._pomodoro
    });

    const deferred = Promise.defer();

    const pomodoro_timer = this._pomodoro.startPomodoro();
    const break_timer = this._pomodoro.startBreak();
    const post_break = this._slack_bot.post(this._channel_id, `start break for ${this._pomodoro.break_time} min!`);
    const post_start = this._slack_bot.post(this._channel_id, `start pomodoro for ${this._pomodoro.pomodoro_time} min!`);
    const post_finish = this._slack_bot.post(this._channel_id, `your pomodoro session has finished!`);

    post_start.then(() => {
      console.log("started");
      pomodoro_timer.then(() => {
        console.log("pomodoro done");
        post_break.then(() => {
          console.log("started");
          break_timer.then(() => {
            console.log("break done");
            post_finish.then(() => {
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
    // on reset
    // breakTimer.resetTimer();
  }
}

// Using FlyWeight pattern
module.exports = class UserFactory {
  constructor() {
    this.pool = {};
  }

  static get(user_id, user_name, channel_id, pomodoro, slack_bot) {
    this.pool = Object.assign({}, this.pool);
    if(this.pool[user_id]) {
      return this.pool.user_id;
    }
    const user = new User(user_id, user_name, channel_id, pomodoro, slack_bot);
    Object.assign(this.pool, {
      [user_id]: user
    });
    return user;
  }
}