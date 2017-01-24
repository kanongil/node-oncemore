"use strict";

module.exports = oncemore;

function OncemoreRegistration(events, handler, trailing) {
  this.e = events;
  this.h = handler;
  this.t = trailing;
}


OncemoreRegistration.prototype.register = function (emitter) {

  var self = this;

  var apply = function g() {

    var events = self.e;
    self.e = [];
    for (var idx = 0; idx < events.length; idx++) {
      emitter.removeListener(events[idx], apply);
    }

    self.h.apply(this, arguments);
  };

  if (this.t) {
    for (var idx = 0; idx < this.e.length; idx++) {
      emitter.on.apply(emitter, [this.e[idx], apply].concat(this.t));
    }
  } else {
    for (var idx = 0; idx < this.e.length; idx++) {
      emitter.on(this.e[idx], apply);
    }
  }

  return emitter;
};


OncemoreRegistration.prototype.registerMore = function (emitter) {

  var self = this;
  var bindings = new Array(this.e.length);

  var applyType = function (type) {

    return function g() {

      var events = self.e;
      self.e = [];
      for (var idx = 0; idx < events.length; idx++) {
        if (bindings[idx]) {
          emitter.removeListener(events[idx], bindings[idx]);
        }
      }

      self.h.apply(this, [type].concat(Array.prototype.slice.call(arguments)));
    }
  };

  if (this.t) {
    for (var idx = 0; idx < this.e.length; idx++) {
      var type = this.e[idx];
      var fn = bindings[idx] = applyType(type);
      emitter.on.apply(emitter, [type, fn].concat(this.t));
    }
  } else {
    for (var idx = 0; idx < this.e.length; idx++) {
      var type = this.e[idx];
      var fn = bindings[idx] = applyType(type);
      emitter.on(type, fn);
    }
  }

  return emitter;
};


var parseArgs = function parseArgs(args, start) {

  // The listener is the first `function` argument

  var listenIdx = ~~start;
  var events;

  if (listenIdx === 0 && Array.isArray(args[0])) {
    events = args[0];
    listenIdx = 1;
  } else {
    for (; listenIdx < args.length; listenIdx++) {
      if (typeof args[listenIdx] === 'function') {
        break;
      }
    }
    events = args.slice(0, listenIdx);
  }

  if (listenIdx === args.length) {
    throw TypeError('"listener" argument must be a function');
  }

  // Remember trailing parameters in case it is used

  var trailingIdx = listenIdx + 1;
  var trailing = args.length > trailingIdx ? args.slice(trailingIdx) : null;

  return new OncemoreRegistration(events, args[listenIdx], trailing);
};


function oncemore(emitter) {

  if (!emitter) {
    return emitter;
  }

  var once = emitter.once;
  if (once && !once._old) {
    emitter.once = function(type) {

      if (arguments.length <= 2) {         // Skip if there isn't more than one event
        return once.apply(this, arguments);
      }

      var reg = parseArgs(Array.prototype.slice.call(arguments), 2);
      return reg.register(this);
    };
    emitter.once._old = once;

    emitter.oncemore = function(type) {

      var reg = parseArgs(Array.prototype.slice.call(arguments), 0);
      return reg.registerMore(this);
    };
  }

  return emitter;
}
