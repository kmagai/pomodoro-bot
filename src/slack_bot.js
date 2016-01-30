"use strict"

const request = require('request');
const config = require('./config.js')

// TODO: use State Pattern or Strategy Pattern

module.exports = class SlackBot {
  // module.exports = new SlackBot('pomodoro', ':tomato:');
  constructor(options) {
    this._bot_name = options.bot_name;
    this._icon_emoji = options.icon_emoji;
  }

  static create(config) {
    config = Object.assign(this._get_default_config(), config);
    return new SlackBot(config);
  }

  static _get_default_config() {
    return config.user_config_default;
  }

  _bot_post(channel_id, text) {
    const path = process.env.INCOMING_WEBHOOK_PATH;
    const uri = 'https://hooks.slack.com/services' + path;
    const deferred = Promise.defer();
    const bot = {
      text: text,
      username: this._bot_name,
      channel: channel_id,
      icon_emoji: this._icon_emoji,
    }
    console.log(bot);

    // TODO: do not return promise
    request({
      uri: uri,
      method: 'POST',
      body: JSON.stringify(bot)
    }, function (err, response, body) {
      if(err) return next(err);
      if(response.statusCode !== 200) return next(new Error('Incoming WebHook: ' + response.statusCode + ' ' + body));
    });
  }

  post(res, channel_id, text) {
    return this._bot_post(channel_id, text);
  }
}