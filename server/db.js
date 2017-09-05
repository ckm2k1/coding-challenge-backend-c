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
  const sc = {
    ldist: 0,
    score: 0,
    distance: 0,
    population: 0
  };

  // Reduce the jaro-winkler score to give
  // room for distance and population bonuses
  // to float results up.
  let score = ldist - 0.1;
  sc.ldist = score;

  if (distance) {
    let ds = 0;
    // Very close
    if (distance <= 100) ds += 0.05;
    // Reasonably close
    else if (distance <= 300) ds += 0.03;
    // Road trip
    else if (distance <= 500) ds += 0.02;
    // Serious road trip
    else if (distance <= 1000) ds += 0.01;

    score += ds;
    sc.distance = ds;
  }

  if (population) {
    let ps = 0;

    // Megapolis
    if (population >= 5000000) ps = 0.07;
    // Cities
    else if (population >= 1000000) ps = 0.05;
    // Mid-towns
    else if (population >= 100000) ps = 0.03;
    // Small towns
    else if (population >= 50000) ps = 0.0;
    // rural towns.
    else if (population >= 10000) ps = 0.01;

    score += ps;
    sc.population = ps;
  }

  // Normalize
  sc.score = score < 0 ? 0 : (score > 1 ? 1 : score);
  return sc;
}

module.exports = DB;
