var EE = require('events').EventEmitter,
    EE3 = require('eventemitter3'),
    assert = require('assert');

var oncemore = require('../oncemore');

suite(oncemore(new EE()));
suite(oncemore(new EE3()), { test: true });

function suite(emitter, ctx) {
  var once_called = 0;
  emitter.once('abc', 'def', 'ghi', function(arg1) {
    console.error('letters', arg1);
    assert.equal(arguments.length, 1);
    assert.equal(arg1, 'first');
    assert.notEqual(this.test, true);
    once_called++;
  });

  if (ctx) {
    emitter.once('abc', 'def', 'ghi', function(arg1) {
      console.error('letters ctx', arg1);
      assert.equal(arguments.length, 1);
      assert.equal(arg1, 'first');
      assert.equal(this, ctx);
      once_called++;
    }, ctx);
  }

  var oncemore_called = 0;
  emitter.oncemore('abc', 'def', 'ghi', function(type, arg1) {
    console.error('emitted', type, arg1);
    assert.equal(arguments.length, 2);
    assert.equal(arg1, 'first');
    assert.equal(type, 'def');
    oncemore_called++;
  });

  if (ctx) {
    emitter.oncemore('abc', 'def', 'ghi', function(type, arg1) {
      console.error('emitted ctx', type, arg1);
      assert.equal(arguments.length, 2);
      assert.equal(arg1, 'first');
      assert.equal(type, 'def');
      assert.equal(this, ctx);
      oncemore_called++;
    }, ctx);
  }

  emitter.emit('def', 'first');
  emitter.emit('abc', 'second');

  var savedOn = emitter.on;
  emitter.on = function(ev, fn) {
    var res = savedOn.call(this, ev, fn);

    if (ev === 'def')
      this.emit('def', 'immediate');

    return res;
  }

  // Check array support

  var oncemore_called2 = false;
  emitter.oncemore(['abc', 'def', 'ghi'], function(type, arg1) {
    console.error('emitted', type, arg1);
    assert.equal(arguments.length, 2);
    assert.equal(arg1, 'immediate');
    assert.equal(type, 'def');
    oncemore_called2 = true;
  });

  emitter.emit('abc', 'late');

  process.on('exit', function() {
    assert.equal(once_called, 1 + ~~!!ctx);
    assert.equal(oncemore_called, 1 + ~~!!ctx);
    assert(oncemore_called2);

    // check that no listeners remain
    assert(!emitter._events.abc);
    assert(!emitter._events.def);
    assert(!emitter._events.ghi);

    console.error('done!');
  });
}
