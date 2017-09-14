// Implementation of Jaro-Winkler distance algorithm.
// Ported from strcmp95.c, the original implementation by
// Jaro and Winkler found here:
// http://web.archive.org/web/20100227020019/http://www.census.gov/geo/msb/stand/strcmp.c
function distance(str1, str2, ignoreCase = true) {
  var s1l = str1.length;
  var s2l = str2.length;
  var str1_flag = new Array(s1l);
  var str2_flag = new Array(s2l);
  var range = Math.floor(Math.max(s1l, s2l) / 2) - 1;
  var minv = Math.min(s1l, s2l);

  range = range < 0 ? 0 : range;

  // console.log(s1l, s2l, range, minv);

  if (ignoreCase) {
    str1 = str1.toUpperCase();
    str2 = str2.toUpperCase();
  }

  // Find matches.
  var matchingChars = 0;
  var s2LastIndex = s2l - 1;
   for (var i = 0; i < s1l; i++) {
    var low = i >= range ? i - range : 0;
    var high = (i + range) <= s2LastIndex ? i + range : s2LastIndex;

    for (var j = low; j <= high; j++) {
      if (str2_flag[j] !== true && str1[i] === str2[j]) {
        str1_flag[i] = str2_flag[j] = true;
        matchingChars++;
        break;
      }
    }
  }
  // console.log('matching:', matchingChars);

  if (!matchingChars) return 0.0;

  // Count transpositions
  var trx = 0;
  var k = 0;
  for (var i = 0; i < s1l; i++) {
    if (str1_flag[i] === true) {
      var j;
      for (j = k; j < s2l; j++) {
        if (str2_flag[j]) {
          k = j + 1;
          break;
        }
      }
      if (str1[i] !== str2[j]) trx++;
    }
  }
  // console.log('trx:', trx);

  trx = Math.floor(trx / 2);

  var weight = (matchingChars / s1l + matchingChars / s2l + ((matchingChars - trx) / matchingChars)) / 3;
  // console.log('weight', weight);

  if (weight > 0.7) {
    var j = (minv >= 4) ? 4 : minv;
    var i;
    for (i=0; ((i < j) && (str1[i] === str2[i])); i++);
    if (i) weight = weight + i * 0.1 * (1 - weight);
  }

  return weight;
}

module.exports = distance;