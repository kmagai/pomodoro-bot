"use strict"

const redis = require('redis');
const url = require('url');

let util = {};

// TODO: 永続化
function getRedisClient() {
  if(process.env.REDISTOGO_URL) {
    var rtg = url.parse(process.env.REDISTOGO_URL);
    var client = redis.createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(":")[1]);
    return client;
  } else {
    return redis.createClient();
  }
}

util.redis_client = getRedisClient();
module.exports = util;
