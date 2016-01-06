"use strict"

const request = require('request');

module.exports = class SlackBot {
  constructor(channel_id, bot_name, icon_emoji) {
    this._channel_id = channel_id;
    this._bot_name = bot_name;
    this._icon_emoji = icon_emoji;
  }

  post(text) {
    const path = process.env.INCOMING_WEBHOOK_PATH;
    const uri = 'https://hooks.slack.com/services' + path;
    const deferred = Promise.defer();

    const bot = {
      text: text,
      username: this._bot_name,
      channel: this._channel_id,
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