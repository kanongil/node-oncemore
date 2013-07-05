"use strict";

var util = require('util');

module.exports = oncemore;

function oncemore(emitter) {
  if (!emitter) return emitter;

  var once = emitter.once;
  if (once && !once._old) {
    emitter.once = function(type) {
      if (arguments.length <= 2)
        return once.apply(this, arguments);

      var listener = arguments.length ? arguments[arguments.length-1] : undefined;
      if (typeof listener !== 'function')
        throw TypeError('listener must be a function');

      var types = Array.prototype.slice.call(arguments, 0, -1);
      types.forEach(function(type) {
        this.on(type, g);
      }, this);

      function g() {
        types.forEach(function(type) {
          this.removeListener(type, g);
        }, this);

        listener.apply(this, arguments);
      }

      return this;
    };
    emitter.once._old = once;

    emitter.oncemore = function(type) {
      var listener = arguments.length ? arguments[arguments.length-1] : undefined;
      if (typeof listener !== 'function')
        throw TypeError('listener must be a function');

      var types = Array.prototype.slice.call(arguments, 0, -1);
      var bindings = types.map(function(type) {
        var fn = g.bind(this, type);
        this.on(type, fn);
        return [type, fn];
      }, this);

      function g() {
        bindings.forEach(function(binding) {
          this.removeListener(binding[0], binding[1]);
        }, this);

        listener.apply(this, arguments);
      }

      return this;
    };
  }

  return emitter;
}
