/**
 * Scoring function takes JW distance and adds
 * bonuses based on city population and distance
 * from user.
 *
 * Note that cities between 100-400km from the user get the highest
 * boost because I'm assuming that would be the most common bus trip.
 *
 * Large metro areas are also the highest boosted because I'm assuming that
 * bus trips between very small towns are quite unlikely and most users will
 * search for large cities.
 *
 * Scores of more than 1 amond the matches are possible. This is on purpose
 * because due to amobiguities in same-name cities, or missing the user location
 * it's impossible to tell which city is the right one. We normalize the scores to 1
 * instead and display it in descending order.
 *
 * @param {number} ldist The Jaro Winkler distance.
 * @param {integer} population City population.
 * @param {integer} [distance] Distance from user in km of the given match.
 *
 * @return {object} An object with a score component, and the individual
 *                     scores of each element. Useful for debugging.
 */
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
    if (distance <= 100) ds += 0.04;
    // Reasonably close. This is one of
    // the most common distances between
    // large metropolitain areas.
    else if (distance <= 400) ds += 0.05;
    // Road trip
    else if (distance <= 600) ds += 0.03;
    // Serious road trip
    else if (distance <= 1000) ds += 0.02;

    score += ds;
    sc.distance = ds;
  }

  if (population) {
    let ps = 0;

    // Megapolis
    if (population >= 5000000) ps = 0.07;
    // Cities
    else if (population >= 1000000) ps = 0.06;
    // Mid-towns
    else if (population >= 100000) ps = 0.04;
    // Small towns
    else if (population >= 50000) ps = 0.03;
    // rural towns.
    else if (population >= 10000) ps = 0.01;

    score += ps;
    sc.population = ps;
  }

  // Normalize
  sc.score = score < 0 ? 0 : (score > 1 ? 1 : score);
  return sc;
}

module.exports = scorer;