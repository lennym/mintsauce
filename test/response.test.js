'use strict';

const Sauce = require('../');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

describe('response methods', () => {
  let event;
  let context;

  beforeEach(() => {
    event = {};
    context = {};
  });

  describe('send', () => {
    it('calls lambda callback with arguments passed', (done) => {
      const sauce = Sauce();
      sauce.use((inbound, outbound) => {
        outbound.send({ ok: true });
      });
      sauce(event, context, (e, response) => {
        expect(e).not.to.be.ok;
        expect(response).to.deep.equal({ ok: true });
        done();
      });
    });
  });
  describe('error', () => {
    it('calls lambda callback with error instance', (done) => {
      const sauce = Sauce();
      const err = new Error('test error');
      sauce.use((inbound, outbound) => {
        outbound.error(err);
      });
      sauce(event, context, (e) => {
        expect(e).to.equal(err);
        done();
      });
    });
    it('calls lambda callback with error from string if called with a string argument', (done) => {
      const sauce = Sauce();
      const err = 'test error';
      sauce.use((inbound, outbound) => {
        outbound.error(err);
      });
      sauce(event, context, (e) => {
        expect(e.message).to.equal(err);
        done();
      });
    });
    it('calls lambda callback with error from message property if called with an object argument with essage property', (done) => {
      const sauce = Sauce();
      const err = { message: 'test error' };
      sauce.use((inbound, outbound) => {
        outbound.error(err);
      });
      sauce(event, context, (e) => {
        expect(e.message).to.equal(err.message);
        done();
      });
    });
    it('calls lambda callback with "unknown error" if called with anything else', (done) => {
      const sauce = Sauce();
      sauce.use((inbound, outbound) => {
        outbound.error();
      });
      sauce(event, context, (e) => {
        expect(e.message).to.equal('Unknown error occurred');
        done();
      });
    });
  });
});