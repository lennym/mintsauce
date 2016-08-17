'use strict';

const AWS = require('aws-sdk');

function parse (call, response, next) {
  if (!call.event.Records || !call.event.Records.length || !call.event.Records[0].Sns) {
    return next();
  }
  try {
    const body = JSON.parse(call.event.Records[0].Sns.Message);
    call.body = call.body || {};
    Object.assign(call.body, body);
  } catch (e) {
    return next(new Error('Failed to parse SNS message'));
  }
  call.headers = call.headers || {};
  const attrs = call.event.Records[0].Sns.MessageAttributes;
  if (attrs && Object.keys(attrs)) {
    const headers = Object.keys(attrs).reduce((map, key) => {
      map[key] = attrs[key].Value;
      return map;
    }, {});
    Object.assign(call.headers, headers);
  }

  next();
}

function callHelpers (call, response, next) {
  response.sns = response.sns || {};
  response.sns.send = (topic, message, callback) => {
    const msg = Object.assign({}, message, { headers: call.headers });
    const params = {
      TopicArn: `arn:aws:sns:${call.region}:${call.account}:${topic}`,
      MessageStructure: 'json',
      Message: JSON.stringify({ default: JSON.stringify(msg) })
    };
    AWS.SNS.Publish(params, callback);
  };
  next();
}

module.exports = [ parse, callHelpers ];
