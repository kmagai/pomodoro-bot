"use strict"

const request = require('request');

module.exports = class SlackBot {
  constructor(bot_name, channel_id, icon_emoji) {
    this.bot_name = bot_name;
    this.channel_id = channel_id;
    this.icon_emoji = icon_emoji;
  }

  post(text) {
    const path = process.env.INCOMING_WEBHOOK_PATH;
    const uri = 'https://hooks.slack.com/services' + path;
    const deferred = Promise.defer();

    const bot = {
      text: text,
      username: this.bot_name,
      channel: this.channel_id,
      icon_emoji: this.icon_emoji,
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