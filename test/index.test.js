'use strict';

const Sauce = require('../');
const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');

describe('mintsauce', () => {
  let event;
  let context;
  let callback;

  beforeEach(() => {
    event = {};
    context = {};
    callback = () => {};
  });

  describe('basics', () => {
    it('exports a function', () => {
      expect(Sauce).to.be.a('function');
    });

    it('returns a function', () => {
      expect(Sauce()).to.be.a('function');
    });

    it('has a `handle` method', () => {
      expect(Sauce().handle).to.be.a('function');
    });

    it('has a `use` method', () => {
      expect(Sauce().use).to.be.a('function');
    });
  });

  describe('middleware', () => {
    it('can be invoked by claling reutned function directly', (done) => {
      const sauce = Sauce();
      const middleware = sinon.stub().yieldsAsync();
      sauce.use(middleware);
      sauce(event, context, () => {
        expect(middleware).to.have.been.calledOnce;
        done();
      });
    });

    it('calls functions mounted onto middleware', (done) => {
      const sauce = Sauce();
      const middleware1 = sinon.stub().yieldsAsync();
      const middleware2 = sinon.stub().yieldsAsync();
      sauce.use(middleware1);
      sauce.use(middleware2);
      sauce.handle(event, context, () => {
        expect(middleware1).to.have.been.calledOnce;
        expect(middleware2).to.have.been.calledOnce;
        expect(middleware1).to.have.been.calledBefore(middleware2);
        done();
      });
    });

    it('calls lambda callback, and does not call further middleware if one middleware responds with error', (done) => {
      const sauce = Sauce();
      const err = new Error('error');
      const middleware1 = sinon.stub().yieldsAsync(err);
      const middleware2 = sinon.stub().yieldsAsync();
      sauce.use(middleware1);
      sauce.use(middleware2);
      sauce.handle(event, context, (e) => {
        expect(middleware2).not.to.have.been.called;
        expect(e).to.equal(err);
        done();
      });
    });

    it('calls error handling middleware if previous middleware responds with error', (done) => {
      const sauce = Sauce();
      const err = new Error('error');
      const middleware1 = sinon.stub().yieldsAsync(err);
      const middleware2 = sinon.stub().yieldsAsync();
      sauce.use(middleware1);
      sauce.use((err, call, response, next) => { middleware2(err, call, response, next); });
      sauce.handle(event, context, (e) => {
        expect(middleware2).to.have.been.called;
        expect(middleware2).to.have.been.calledWith(err);
        done();
      });
    });

    it('throws calls back with an error if no response is sent', (done) => {
      const sauce = Sauce();
      sauce.handle(event, context, (e) => {
        expect(e).to.be.an.instanceof(Error);
        expect(e.message).to.equal('Middleware stack completed without sending a response');
        done();
      });
    });

    describe('nested stacks', () => {
      it('calls into a nested middleware stack', (done) => {
        const sauce = Sauce();
        const stack = Sauce.Stack();
        const middleware = sinon.stub().yieldsAsync();
        stack.use(middleware);
        sauce.use(stack);
        sauce.handle(event, context, () => {
          expect(middleware).to.have.been.called;
          done();
        });
      });
      it('calls through multiple middleware stacks in series', (done) => {
        const sauce = Sauce();
        const stack1 = Sauce.Stack();
        const stack2 = Sauce.Stack();
        const middleware1 = sinon.stub().yieldsAsync();
        const middleware2 = sinon.stub().yieldsAsync();
        stack1.use(middleware1);
        stack2.use(middleware2);
        sauce.use(stack1);
        sauce.use(stack2);
        sauce.handle(event, context, () => {
          expect(middleware1).to.have.been.called;
          expect(middleware2).to.have.been.called;
          expect(middleware1).to.have.been.calledBefore(middleware2);
          done();
        });
      });
      it('calls through multiple recursively nested middleware stacks', (done) => {
        const sauce = Sauce();
        const stack1 = Sauce.Stack();
        const stack2 = Sauce.Stack();
        const middleware1 = sinon.stub().yieldsAsync();
        const middleware2 = sinon.stub().yieldsAsync();
        stack1.use(middleware1);
        stack2.use(middleware2);
        sauce.use(stack1);
        stack1.use(stack2);
        sauce.handle(event, context, () => {
          expect(middleware1).to.have.been.called;
          expect(middleware2).to.have.been.called;
          expect(middleware1).to.have.been.calledBefore(middleware2);
          done();
        });
      });
    });
  });
});
