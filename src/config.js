"use strict"
const validator = require('validator');

let config = {};


config.break_text = `start break for ${this._break_duration} min!`;
config.finish_text = `your pomodoro session has finished!`;
config.start_text = `start pomodoro for ${this._pomodoro_duration} min!`;

config.slackbot_default_config = {
  bot_name: 'pomodoro',
  icon_emoji: ':tomato:',
  is_silent: true,
}

config.pomodoro_default_config = {
  pomodoro_time: 25,
  break_time: 25,
};

config.user_config_default = {
  pomodoro_time: 25,
  break_time: 25,
  is_silent: true
};

config.user_config_default = {
  pomodoro_time: 25,
  break_time: 25,
  is_silent: true
};

config.bool_map = new Map([
  ['y', true],
  ['yes', true],
  [1, true],
  ['n', false],
  ['no', false],
  [0, false]
]);

config.user_config_type = new Map([
  ['pomodoro_time', Number],
  ['break_time', Number],
  ['is_silent', Boolean]
]);

config.type_validator = new Map([
  [Number, validator.isNumeric],
  [Boolean, validator.isBoolean]
]);

module.exports = config;