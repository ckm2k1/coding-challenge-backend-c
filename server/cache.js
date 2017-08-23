const crypto = require('crypto');

const __cache = {};

module.exports.genKey = function(...args) {
  const hash = crypto.createHash('sha256');
  const input = [...args].join('');

  return hash.update(input).digest('hex');
}

module.exports.get = function(key) {
  return __cache[key];
}

module.exports.set = function(key, val) {
  __cache[key] = val;
}

module.exports.exists = function(key) {
  return typeof __cache[key] !== 'undefined';
}


module.exports.clear = function() {
  __cache = {};
}