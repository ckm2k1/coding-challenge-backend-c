const crypto = require('crypto');

let __cache = {};

module.exports.genKey = function(...args) {
  const hash = crypto.createHash('sha256');
  const input = [...args].join('');

  return hash.update(input).digest('hex');
}

module.exports.read = function(key, callback) {
  process.nextTick(() => {
     callback(null, __cache[key]);
  }, 0);
}

module.exports.store = function(key, val, callback = () => {}) {
  __cache[key] = val;
  process.nextTick(callback, 0);
}

module.exports.exists = function(key) {
  return typeof __cache[key] !== 'undefined';
}

module.exports.clear = function() {
  __cache = {};
}