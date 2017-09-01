const config = require('./config');
const jwDistance = require('./jaro-winkler');
const coords = require('./coords');

function isUndefined(arg) {
  return typeof arg === 'undefined';
}

const MIN_MATCHING_SCORE = 0.6;

class DB {
  constructor() {
    this.__db = null;
  }

  search(term, lat = null, long = null, sort = true) {
    return Promise.resolve()
      .then(() => {
        const weighted = [];
        term = term.toLowerCase();

        // Score, filter and clone the results in one shot.
        this.__db.reduce((matches, city) => {
          const haystack = city.asciiname.toLowerCase();
          const match = Object.assign({}, city);

          if (!isUndefined(lat) && !isUndefined(long)) {
            match.distance = Math.round(coords.dist(lat, long, city.latitude, city.longitude));
          }

          const score = scorer(
            jwDistance(haystack, term),
            city.population,
            match.distance
          );

          if (score > MIN_MATCHING_SCORE) {
            match.score = score;
            matches.push(match);
          }

          return matches;
        }, weighted);

        if (sort) {
          weighted.sort((a, b) => {
            return b.score - a.score;
          });
        }

        return weighted;
      });
  }

  /**
   * Load the database into memory.
   *
   * @return {DB} Returns the DB object.
   */
  load() {
    this.__db = require(config.dbFile);

    return this;
  }
}


function scorer(ldist, population, distance) {
  // Reduce the jaro-winkler score to give
  // room for distance and population bonuses
  // to float results up.
  let score = ldist - 0.15;

  if (distance) {
    // Very close
    if (distance <= 100) score += 0.06;
    // Reasonably close
    else if (distance <= 300) score += 0.03;
    // Road trip
    else if (distance <= 500) score += 0.02;
    // Serious road trip
    else if (distance <= 1000) score += 0.01;
  }

  if (population) {
    // Megapolis
    if (population >= 5000000) score += 0.06;
    // Cities
    else if (population >= 1000000) score += 0.05;
    // Mid-towns
    else if (population >= 100000) score += 0.04;
    // Small towns
    else if (population >= 50000) score += 0.02;
    // rural towns.
    if (population >= 10000) score += 0.01;
  }

  // Normalize
  return score < 0 ? 0 : (score > 1 ? 1 : score);
}

module.exports = DB;
