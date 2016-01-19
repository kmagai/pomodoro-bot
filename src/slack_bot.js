"use strict"

const request = require('request');
const config = require('./config.js')

module.exports = class SlackBot {
  // module.exports = new SlackBot('pomodoro', ':tomato:');
  constructor(bot_name, icon_emoji, is_silent) {
    this._bot_name = bot_name;
    this._icon_emoji = icon_emoji;
    this._is_silent = is_silent;
  }

  static create(config) {
    Object.assign(this._get_default_config(), config);
    return new SlackBot(config.bot_name, config.icon_emoji, config.is_silent);
  }

  static _get_default_config() {
    return config.slackbot_default_config;
  }

  post(channel_id, text) {
    const path = process.env.INCOMING_WEBHOOK_PATH;
    const uri = 'https://hooks.slack.com/services' + path;
    const deferred = Promise.defer();

    const bot = {
      text: text,
      username: this._bot_name,
      channel: channel_id,
      icon_emoji: this._icon_emoji,
    }

    request({
      uri: uri,
      method: 'POST',
      body: JSON.stringify(bot)
    }, function (err, response, body) {
      if(err) {
        deferred.reject(err);
      } else if(response.statusCode !== 200) {
        deferred.reject(new Error('Incoming WebHook: ' + response.statusCode + ' ' + body));
      }
      deferred.resolve(body);
    });

    return deferred.promise;
  }
}
  