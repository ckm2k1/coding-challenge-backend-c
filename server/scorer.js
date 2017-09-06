module.exports = function scorer(ldist, population, distance) {
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
    // large metropole areas.
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