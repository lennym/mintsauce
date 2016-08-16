'use strict';

const Sauce = require('../');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

describe('call properties', () => {
  let event;
  let context;
  let sauce;

  beforeEach(() => {
    event = {};
    context = {
      functionName: 'test-lambda',
      invokedFunctionArn: 'arn:aws:lambda:eu-west-1:1234567890:function:aws-canary-lambda'
    };
    sauce = Sauce();
  });

  it('adds the invoked lambda name to `name` property', (done) => {
    sauce.use((call, response) => {
      expect(call.name).to.equal('test-lambda');
      done();
    });
    sauce(event, context, () => {});
  });
  it('adds the invoked lambda arn to `arn` property', (done) => {
    sauce.use((call, response) => {
      expect(call.arn).to.equal('arn:aws:lambda:eu-west-1:1234567890:function:aws-canary-lambda');
      done();
    });
    sauce(event, context, () => {});
  });
  it('parses the version from the arn to `version` property', (done) => {
    context.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:1234567890:function:aws-canary-lambda:ci';
    sauce.use((call, response) => {
      expect(call.version).to.equal('ci');
      done();
    });
    sauce(event, context, () => {});
  });
  it('sets the `version` property to $LATEST if none is present on the arn', (done) => {
    context.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:1234567890:function:aws-canary-lambda';
    sauce.use((call, response) => {
      expect(call.version).to.equal('$LATEST');
      done();
    });
    sauce(event, context, () => {});
  });
  it('parses the region from the arn to `region` property', (done) => {
    sauce.use((call, response) => {
      expect(call.region).to.equal('eu-west-1');
      done();
    });
    sauce(event, context, () => {});
  });
  it('parses the account id from the arn to `account` property', (done) => {
    sauce.use((call, response) => {
      expect(call.account).to.equal('1234567890');
      done();
    });
    sauce(event, context, () => {});
  });
});
