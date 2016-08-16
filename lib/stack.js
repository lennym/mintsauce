'use strict';

function Stack () {
  const layers = [];
  const errorhandlers = [];
  const stack = (inbound, outbound, callback) => {

    // create a function that recurses over the stack
    const exec = layers
      .map(fn => {
        return (next) => {
          fn(inbound, outbound, next);
        };
      })
      .reduce((fn, layer) => {
        return (next) => {
          fn((e) => {
            if (e) {
              next(e);
            } else {
              try {
                layer(next);
              } catch (e) {
                next(e);
              }
            }
          });
        };
      }, (f) => { f(); });

    // create an errorhandler function that recurses over the error handler stack
    const errhandler = errorhandlers
        .reduce((fn, handler) => {
          return (err, next) => {
            fn(err, (e) => {
              if (e) {
                try {
                  handler(e, inbound, outbound, next);
                } catch (e) {
                  next(e);
                }
              } else {
                next();
              }
            });
          };
        }, (e, f) => { f(e); });

    exec((e) => {
      errhandler(e, (e) => {
        callback(e);
      });
    });
  };
  stack.use = (fn) => {
    if (typeof fn === 'function') {
      if (fn.length === 4) {
        errorhandlers.push(fn);
      } else {
        layers.push(fn);
      }
    } else {
      throw new Error('Invalid middleware');
    }
  };
  return stack;
}

module.exports = Stack;
