const path = require('path');
const os = require('os');

module.exports = {
  dbFile: path.resolve(__dirname, '../data/db.json'),
  search: {
    minResults: 20
  },
  cpus: os.cpus().length
}