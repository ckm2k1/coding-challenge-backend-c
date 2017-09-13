// Implementation of Jaro-Winkler distance algorithm.
// Ported from strcmp95.c, the original implementation by
// Jaro and Winkler found here:
// http://web.archive.org/web/20100227020019/http://www.census.gov/geo/msb/stand/strcmp.c
function distance(str1, str2, ignoreCase = true) {
  const s1l = str1.length;
  const s2l = str2.length;
  const str1_flag = new Array(s1l);
  const str2_flag = new Array(s2l);
  let range = Math.floor(Math.max(s1l, s2l) / 2) - 1;
  let minv = Math.min(s1l, s2l);

  range = range < 0 ? 0 : range;

  // console.log(s1l, s2l, range, minv);

  if (ignoreCase) {
    str1 = str1.toUpperCase();
    str2 = str2.toUpperCase();
  }

  // Find matches.
  let matchingChars = 0;
  const s2LastIndex = s2l - 1;
   for (let i = 0; i < s1l; i++) {
    const low = i >= range ? i - range : 0;
    const high = (i + range) <= s2LastIndex ? i + range : s2LastIndex;

    for (let j = low; j <= high; j++) {
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
  let trx = 0;
  let k = 0;
  for (let i = 0; i < s1l; i++) {
    if (str1_flag[i] === true) {
      let j;
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

  let weight = (matchingChars / s1l + matchingChars / s2l + ((matchingChars - trx) / matchingChars)) / 3;
  // console.log('weight', weight);

  if (weight > 0.7) {
    const j = (minv >= 4) ? 4 : minv;
    let i;
    for (i=0; ((i < j) && (str1[i] === str2[i])); i++);
    if (i) weight += i * 0.1 * (1 - weight);
  }

  return weight;
}

module.exports = distance;