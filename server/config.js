const path = require('path');

module.exports = {
  dbFile: path.resolve(__dirname, '../data/db.json'),
  search: {
    minResults: 20
  }
}