'use strict';

const Sauce = require('../');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

describe('middleware', () => {
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

  describe('SNS', () => {
    it('parses the SNS message body', (done) => {
      event.Records = [
        {
          Sns: {
            Message: '{}'
          }
        }
      ];
      sauce.use(Sauce.middleware.SNS);
      sauce.use((call) => {
        expect(call.body).to.deep.equal({});
        done();
      });
      sauce.use((err, c, r, n) => { done(err); });
      sauce(event, context, () => {});
    });
  });
});