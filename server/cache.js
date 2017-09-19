const crypto = require('crypto');

/**
 * Small cache module used during testing instead of Memored
 * which requires running in a cluster.
 */
let __cache = {};

/**
 * Generate cache keys as sha256 hash values.
 *
 * @param {...[type]} args Any amount of args that will be toString()'d
 *                         and concat'd into a base value to hash.
 *
 * @return {string} A sha256 hash of the input params.
 */
module.exports.genKey = function(...args) {
  const hash = crypto.createHash('sha256');

  return hash.update([...args].join('')).digest('hex');
}

/**
 * Read value from cache. Forced async to emulate
 * the interface of Memored.
 *
 * @param {string} key Key name.
 * @param {Function} callback User callback to call with result.
 *
 * @return {undefined}
 */
module.exports.read = function(key, callback) {
  setImmediate(() => {
     callback(null, __cache[key]);
  }, 0);
}

/**
 * Store a value in cache. Forced async to emulate
 * the interface of Memored.
 *
 * @param {string} key Key name.
 * @param {*} val Any value that can be the RHS value of an object property.
 * @param {function} callback User callback to call when finished storing.
 *
 * @return {undefined}
 */
module.exports.store = function(key, val, callback = () => {}) {
  __cache[key] = val;
  setImmediate(callback, 0);
}

/**
 * Completely clear the cache. Not used
 * but here for completeness.
 *
 * @return {undefined}
 */
module.exports.clear = function() {
  __cache = {};
}