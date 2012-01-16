var assert = {
  equal: function(expected, actual) {
    if (actual === expected) return;
    throw new Error('Expected ' + expected + ' to equal ' + actual);
  },

  unEqual: function(expected, actual) {
    if (actual !== expected) return;
    throw new Error('Expected ' + expected + ' NOT to equal ' + actual);
  },

  ok: function(value) {
    if (value) return;
    throw new Error('Expected ' + value + ' to be truthy');
  }
};
