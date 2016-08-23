const Stack = require('./stack');
const call = require('./call');
const response = require('./response');

function Sauce () {
  const stack = Stack();
  const sauce = function (e, c, callback) {
    handle(e, c, callback);
  };
  function handle (event, context, callback) {
    // create our mapped objects from the original lambda inputs
    const _call = call(event, context, callback);
    const _response = response(event, context, callback);
    stack(_call, _response, (e) => {
      if (e) {
        _response.error(e);
      } else {
        _response.error(new Error('Middleware stack completed without sending a response'));
      }
    });
  }
  function use (fn) {
    stack.use(fn);
  }
  function _catch (fn) {
    stack.catch(fn);
  }
  sauce.handle = handle;
  sauce.use = use;
  sauce.catch = _catch;
  return sauce;
}

Sauce.Stack = Stack;
Sauce.middleware = require('./middleware');

module.exports = Sauce;
