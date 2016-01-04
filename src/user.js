"use strict"

module.exports = class User {
  constructor(user_id, user_name, pomodoro) {
    this.user_id = user_id;
    this.user_name = user_name;
    this.pomodoro = pomodoro;
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

    const deferred = Promise.defer();

    const pomodoroTimer = this.pomodoro.startPomodoro();
    const breakTimer = this.pomodoro.startBreak();
    
    pomodoroTimer.then(() => {
      breakTimer.then(() => {
        this.pomodoro.finishSession().then(() => {
          deferred.resolve();
        })
      })
    }).catch(err => {
      deferred.reject(err);
      return res.status(200).end();
    });
    
    // breakTimer.resetTimer();
    
    return deferred.promise;
  }
}