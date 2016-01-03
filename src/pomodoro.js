"use strict"

module.exports = class Pomodoro {
  constructor(pomodoroTime, breakTime, slackBot) {
    this.pomodoroTime = pomodoroTime;
    this.breakTime = breakTime;
    this.slackBot = slackBot;
  }

  startPomodoro() {
    this.slackBot.post(`start pomodoro for ${this.pomodoroTime} min!`).catch(err => {
      return next(err);
    });

    return new Promise((resolve, reject) => {
      // setTimeout(resolve, pomodoroTime * 60 * 1000);
      setTimeout(resolve, 2000);
    });
  }

  startBreak() {
    this.slackBot.post(`Done! Let's have a break for ${this.breakTime}min!`).catch(err => {
      return next(err);
    });

    return new Promise((resolve, reject) => {
      // setTimeout(resolve, breakTime * 60 * 1000);
      setTimeout(resolve, 2000);
    });
  }

  finishSession() {
    this.slackBot.post(`Your pomodoro session has done!`).catch(err => {
      return next(err);
    });

    // const client = getRedisClient;
    // client.set(redis_user_key, JSON.stringify(userPomodoro));
  }

};