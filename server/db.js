const fs = require('fs');
const config = require('./config');
const Fuse = require('fuse.js');

// Fuse options
const options = {
  caseSensitive: true,
  shouldSort: true,
  tokenize: true,
  includeScore: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "name",
    "asciiname",
    "alternatenames"
  ]
};

function DB(options) {
  this.__db = null;
}

DB.prototype.search = function(term) {
  const results = this.fuse.search(term);
  // 1. iterate over rows
  // 2. see if asciiname or othernames matches (regex ?)
  // 3. return if no matches
  // 4. return the match accorinding to scoring algo
  // with coordinates and unique id.
  return results;
}

DB.prototype.load = function() {
  this.__db = require(config.dbFile);
  this.fuse = new Fuse(this.__db, options);

  return this;
}

/**
 * This whole function would normally be a pretty bad idea
 * for parsing arbitrary .tsv files, but hey, the input is
 * fixed and normalized so we go with the simple solution.
 */
// DB.prototype.parse = function(raw) {
//   const rows = raw.split('\n');
//   // Drop the header row.
//   rows.shift();

//   const db = {};
//   rows.forEach((r) => {
//     const [
//       id,
//       name,
//       asciiname,
//       alternatenames,
//       latitude,
//       longitude,
//       , ,
//       countryCode,
//       , , , , ,
//       population
//     ] = r.split('\t');

//     db[id] = {
//       name,
//       asciiname,
//       alternatenames: alternatenames && alternatenames.split(','),
//       latitude: parseFloat(latitude),
//       longitude: parseFloat(longitude),
//       countryCode,
//       population: parseInt(population)
//     };
//   });

//   // console.log(db[Object.keys(db)[2]]);

//   return db;
// }

module.exports = DB;