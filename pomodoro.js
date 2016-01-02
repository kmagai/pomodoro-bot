"use strict"
var request = require('request');

module.exports = function (req, res, next) {
  let currentPomodoro = null;
  const defaultDuration = 25;
  
  if(!req.body.text) {
    return res.status(200).send('/pomodoro <duration>');
  }

  // TODO: use redis to memorize
  const matches = req.body.text.match(/^(\d+)$/);
  const duration = (matches && matches[1]) ? matches[1] : defaultDuration;

  const bot = {
    text: `${req.body.user_name}は${duration}分間集中するよ`,
    username: 'pomodoro-ojisan',
    channel: req.body.channel_id,
    icon_emoji: ':tomato:',
  }
  
  sendSlack(bot).then(function () {
    return next(error);
  }).catch(function () {
    return res.status(200).end();
  });

}


function sendSlack(payload, callback) {
  const path = process.env.INCOMING_WEBHOOK_PATH;
  const uri = 'https://hooks.slack.com/services' + path;
  let deferred = Promise.defer();

  request({
    uri: uri,
    method: 'POST',
    body: JSON.stringify(payload)
  }, function (error, response, body) {
    if(error) {
      deferred.reject(error);
    } else if(response.statusCode !== 200) {
      deferred.reject(new Error('Incoming WebHook: ' + response.statusCode + ' ' + body));
    }
    deferred.resolve(response.statusCode, body);
  });

  return deferred.promise;
}