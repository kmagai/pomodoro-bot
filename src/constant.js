"use strict"

let constant = {};

constant.help_message = `
[available commands]
'/pomodoro start' start your pomdoro session
'/pomodoro reset' reset your pomodoro session
'/pomodoro config' check your pomodoro setting
'/pomodoro config pomodoro_time=N' change your pomodoro time to N (N = min)
'/pomodoro config break_time=N' change your break time to N (N = min)
'/pomodoro config is_silent=[y|n]' in silent mode, pomodoro does't post on your channel and only you can check it.
`;

module.exports = constant;