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
      console.log('ERROR: You already have a pomodoro session');
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

    const break_text = `start break for ${this._pomodoro.break_time} min!`;
    const start_text = `start pomodoro for ${this._pomodoro.pomodoro_time} min!`;
    const finish_text = `your pomodoro session has finished!`;

    this._slack_bot.post(this._channel_id, start_text).then(() => {
      console.log("pomodoro started");
      const start_pomodoro = this._pomodoro.startPomodoro();
      Object.assign(user_pomodoros, {
        [this._user_id]: start_pomodoro
      });
      start_pomodoro.then(() => {
        console.log("pomodoro done");
        this._slack_bot.post(this._channel_id, break_text).then(() => {
          console.log("break started");
          const start_break = this._pomodoro.startBreak();
          Object.assign(user_pomodoros, {
            [this._user_id]: start_break
          });
          start_break.then(() => {
            console.log("break done");
            delete user_pomodoros[this._user_id];
            this._slack_bot.post(this._channel_id, finish_text).then(() => {
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

// Using FlyWeight pattern
module.exports = class UserFactory {
  constructor() {
    this.pool = {};
  }

  static get(user_id, user_name, channel_id, pomodoro, slack_bot) {
    this.pool = Object.assign({}, this.pool);
    if(this.pool[user_id]) {
      return this.pool[user_id];
    }
    const user = new User(user_id, user_name, channel_id, pomodoro, slack_bot);
    Object.assign(this.pool, {
      [user_id]: user
    });
    return user;
  }
}