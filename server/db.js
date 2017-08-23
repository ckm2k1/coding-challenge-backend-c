const fs = require('fs');
const config = require('./config');
const jwDistance = require('./jaro-winkler');
const coords = require('./coords');

function isUndefined(arg) {
  return typeof arg === 'undefined';
}

function DB(options) {
  this.__db = null;
}

DB.prototype.search = function(term, lat, long) {
  const minMatchingScore = 0.6;
  const weighted = [];
  term = term.toLowerCase();

  // Score, filter and clone the results in one shot.
  this.__db.reduce((matches, city) => {
    const haystack = city.asciiname.toLowerCase();
    const match = Object.assign({}, city);

    let distance;
    if (!isUndefined(lat) && !isUndefined(long)) {
      match.distance = Math.round(coords.dist(lat, long, city.latitude, city.longitude));
    }

    const score = scorer(
      jwDistance(haystack, term),
      city.population,
      match.distance
    );

    if (score > minMatchingScore) {
      match.score = score;
      matches.push(match);
    }

    return matches;
  }, weighted);

  weighted.sort((a, b) => {
    return b.score - a.score;
  });

  return weighted;
}

/**
 * Load the database into memory.
 *
 * @return {DB} Returns the DB object.
 */
DB.prototype.load = function() {
  this.__db = require(config.dbFile);

  return this;
}

function scorer(ldist, population, distance) {
  // Reduce the jaro-winkler score a little to give
  // room for distance and population bonuses
  // to float up.
  let score = ldist - 0.1;

  if (distance) {
    if (distance <= 100) score += 0.17;
    else if (distance <= 300) score += 0.12;
    else if (distance <= 500) score += 0.05;
    else if (distance <= 1000) score += 0.03;
  }

  if (population) {
    // Megapolis
    if (population >= 5000000) score += 0.15;
    // Cities
    else if (population >= 1000000) score += 0.1;
    // Mid-towns
    else if (population >= 100000) score += 0.07;
    // Small towns
    else if (population >= 50000) score += 0.05;
    // rural towns.
    if (population >= 10000) score += 0.02;
  }

  return score < 0 ? 0 : (score > 1 ? 1 : score);
}

module.exports = DB;
