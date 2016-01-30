"use strict"
const validator = require('validator');

let config = {};


config.user_config_default = {
  pomodoro_time: 25,
  break_time: 25,
  is_silent: true,
  bot_name: 'pomodoro',
  icon_emoji: ':tomato:',
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