# mintsauce

Makes lamb(da) more delicious.

Express inspired middleware chains for AWS Lamdba functions.

## Usage:

```javascript
const sauce = require('mintsauce');
const lambda = sauce();

lambda.use((call, response, next) => {
  // ... your code here
  next();
});
lambda.use((call, response, next) => {
  response.send({ ok: true });
});

module.exports = lambda;
```

## Middleware

Middleware functions take three arguments - `call`, `response`, `next`.

### `call`

Contains metadata based on the parameters with which the lambda was called.

#### Properties

* `name` - The lambda function name
* `version` - The lambda function version
* `arn` - The ARN of the invoked function
* `region` The AWS region of the lambda
* `account` - The account id of the lambda function

Additionally the original `event` and `context` are available on properties with the same names.

### `response`

An object containing helper functions for sending a response to the lambda's callback function.

#### Methods

* `send` - Sends a successful response to the lambda's callback. Passes the first argument to the callback. Any other arguments are ignored.
* `error` - Sends a failure response to the lambda's callback. The first argument can be an `Error`, `String` or any object with a  `message` property. If no argument is provided (or invalid argument is provided) then a generic error will be returned.

### `next`

A callback function used to pass execution to the next function in the middleware stack.

## Error Handling

As with express, error handlers are simply middlewares with an additional first argument representing the error. When a function with 4 arguments is passed to `use` it is automatically mounted as an error handler.

Error handlers may pass the error to subsequent handlers by passing it to `next` as any other middleware.

### Example:

```javascript
const sauce = require('mintsauce');
const lambda = sauce();

lambda.use((call, response, next) => {
  next(new Error('example error'));
});
lambda.use((err, call, response, next) => {
  // error thrown in an earlier middleware is caught here
  response.error(err);
});

module.exports = lambda;
```

Alternatively, a function with any number of arguments can be passed to the `catch` method of a lambda or middleware stack.

```javascript
const sauce = require('mintsauce');
const lambda = sauce();

lambda.use((call, response, next) => {
  next(new Error('example error'));
});
lambda.catch((err) => {
  // error thrown in an earlier middleware is caught here
  response.error(err);
});

module.exports = lambda;
```

## Promises

If a middleware returns an object that implements a Promise-like interface then this will be used to handle progression to the next middleware layer. These can either be native Promises, or a third-party library.

### Example:

```javascript
const sauce = require('mintsauce');
const lambda = sauce();
const BluebirdPromise = require('bluebird');

lambda.use((call, response) => {
  return new Promise((resolve, reject) => {
    // ..
    resolve();
  });
});
lambda.use((call, response) => {
  return BluebirdPromise.resolve()
    .then(() => {
      // your code here
    });
});

module.exports = lambda;
```

Note that the resolved value of a promise is discarded, and will not be used for anything.