const config = require('./config');
const jwDistance = require('./jw');
const coords = require('./coords');
const scorer = require('./scorer');

function isUndefined(arg) {
  return typeof arg === 'undefined';
}

// This should be extracted to a config file.
const MIN_MATCHING_SCORE = 0.7;

/**
 * Tiny, pretend DB class.
 */
class DB {
  /**
   * Constructor.
   *
   * @return {undefined}
   */
  constructor() {
    this.__db = null;
  }

  /**
   * Returns a possibly sorted list of matches against user provided
   * 'term'.
   *
   * @param {string} term User input term.
   * @param {number} lat User's latitude.
   * @param {number} long User's longitude.
   * @param {boolean} sort Should we sort the output array.
   *
   * @return {array} An array of scored matches or empty array if non qualify.
   */
  search(term, lat = null, long = null, sort = true) {
    return Promise.resolve()
      .then(() => {
        const weighted = [];

        // Score, filter and clone the results in one shot.
        this.__db.reduce((matches, city) => {
          const target = city.asciiname;

          let distance;
          if (!isUndefined(lat) && !isUndefined(long)) {
            distance = Math.round(coords.dist(lat, long, city.latitude, city.longitude));
          }

          const score = scorer(
            jwDistance(term, target),
            city.population,
            distance
          );

          if (score.score > MIN_MATCHING_SCORE) {
            matches.push(Object.assign({comps: score, score: score.score, distance}, city));
          }

          return matches;
        }, weighted);

        if (sort) {
          weighted.sort((a, b) => {
            const scoreDiff = b.score - a.score;
            // Sort by closest distance if the score is the same.
            return scoreDiff === 0 && b.distance ?
              a.distance - b.distance :
              scoreDiff;
          });
        }

        return weighted;
      });
  }

  /**
   * Load the DB into memory.
   *
   * @return {DB}
   */
  load() {
    this.__db = require(config.dbFile);

    return this;
  }
}

module.exports = DB;
