const path = require('path');
const os = require('os');

/**
 * Shared config used by instances of express and the master process.
 *
 * @type {Object}
 */
module.exports = {
  dbFile: path.resolve(__dirname, '../data/db.json'),
  search: {
    minResults: 20
  },
  cpus: os.cpus().length,
  isDev: process.env.NODE_ENV === 'development'
}