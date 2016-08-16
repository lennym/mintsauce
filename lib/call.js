'use strict';

function parseArn (arn) {
  arn = arn || '';
  const props = {};
  const bits = arn.split(':');
  props.region = bits[3];
  props.account = bits[4];
  props.version = bits[7] || '$LATEST';
  return props;
}

module.exports = function (event, context, callback) {
  const props = parseArn(context.invokedFunctionArn);
  return Object.assign({
    _event: event,
    _context: context,
    arn: context.invokedFunctionArn,
    name: context.functionName,
    headers: event.headers
  }, props);
};
