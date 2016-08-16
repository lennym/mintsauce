'use strict';

module.exports = function (event, context, callback) {
  return {
    send: (response) => {
      callback(null, response);
    },
    error: (err) => {
      err = err || {};
      if (typeof err === 'string') {
        callback(new Error(err));
      } else if (err instanceof Error) {
        callback(err);
      } else if (typeof err.message === 'string') {
        callback(new Error(err.message));
      } else {
        callback(new Error('Unknown error occurred'));
      }
    }
  };
};
