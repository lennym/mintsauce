'use strict';

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

module.exports = parse;
