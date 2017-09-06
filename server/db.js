const config = require('./config');
const jwDistance = require('./jaro-winkler');
const coords = require('./coords');
const scorer = require('./scorer');

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

          let distance;
          if (!isUndefined(lat) && !isUndefined(long)) {
            distance = Math.round(coords.dist(lat, long, city.latitude, city.longitude));
          }

          const score = scorer(
            jwDistance(term, haystack),
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

  load() {
    this.__db = require(config.dbFile);

    return this;
  }
}

module.exports = DB;
