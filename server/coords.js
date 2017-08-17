const EARTH_RADIUS = 6371; //meters

// Calculates the distance between 2 lat,lang coord sets.
// Output is distance in km. Uses the equirectangular approximation,
// trading accuracy for speed and simplicity.
function dist(lat1, long1, lat2, long2) {
  // Convert from degrees to radians.
  lat1 = lat1*Math.PI/180;
  long1 = long1*Math.PI/180;
  lat2 = lat2*Math.PI/180;
  long2 = long2*Math.PI/180;

  const x = (long2-long1) * Math.cos((lat1+lat2)/2);
  const y = (lat2-lat1);
  return Math.sqrt(x*x + y*y) * EARTH_RADIUS;
}

module.exports.dist = dist;