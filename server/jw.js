/**
 * Ported from strcmp95.c.
 * the original implementation by Jaro and Winkler found here:
 * http://web.archive.org/web/20100227020019/http://www.census.gov/geo/msb/stand/strcmp.c
 *
 * Computes the Jaro-Winkler distance for 2 given strings.
 * str1 would usually be user input, and str2 the reference text
 * to match against.
 *
 * @param {string} str1 User input.
 * @param {string} str2 Target text.
 * @param {boolean} ignoreCase Self explanatory.
 *
 * @return {number} Returns a float between [0.0,1.0]
 */
function distance(str1, str2) {
  // The reason this module uses 'let' and not 'let/const' is because
  // V8 deoptimizes this function with 'Unsupported phi use of const or let variable'.
  // To get around the problem quickly, we switch to 'let'.
  const s1l = str1.length;
  const s2l = str2.length;
  // Or'ing 0 with something will yeild a 32bit integer which should be plenty for
  // most operations, since few words are greater than 32 characters.
  let str1_flag = 0|0;
  let str2_flag = 0|0;
  const s2LastIndex = s2l - 1;
  const minv = Math.min(s1l, s2l);

  let range = Math.floor(Math.max(s1l, s2l) / 2) - 1;
  let matchingChars = 0;
  let i, j, k, trx, weight;

  range = range < 0 ? 0 : range;

  // if (ignoreCase) {
  //   str1 = str1.toLowerCase();
  //   str2 = str2.toLowerCase();
  // }

  // Find matches.
   for (i = 0; i < s1l; i++) {
    const low = i >= range ? i - range : 0;
    const high = (i + range) <= s2LastIndex ? i + range : s2LastIndex;

    for (j = low; j <= high; j++) {
      if (!(str2_flag & (1 << j)) && str1[i] === str2[j]) {
        str1_flag = str1_flag | (1 << i);
        str2_flag = str2_flag | (1 << j);
        // str1_flag[i] = str2_flag[j] = true;
        matchingChars++;
        break;
      }
    }
  }

  if (!matchingChars) return 0.0;

  // Count transpositions
  trx = 0;
  k = 0;
  for (i = 0; i < s1l; i++) {
    if (str1_flag & (1 << i)) {
      for (j = k; j < s2l; j++) {
        if (str2_flag & (1 << j)) {
          k = j + 1;
          break;
        }
      }
      if (str1[i] !== str2[j]) trx++;
    }
  }

  // The Jaro weight.
  weight = (matchingChars / s1l + matchingChars / s2l + ((matchingChars - Math.floor(trx / 2)) / matchingChars)) / 3;

  // Prefix based boosting if weight crosses threshold.
  // This param is tunable depending on how much you want
  // to relax the results.
  if (weight > 0.7) {
    j = (minv >= 4) ? 4 : minv;
    for (i=0; ((i < j) && (str1[i] === str2[i])); i++);

    //Boost up the score based on the prefix match.
    //The 0.1 value is a constant taken straight from the
    //original implementation, but can be tuned to achieve
    //larger result sets.
    if (i) weight = weight + i * 0.1 * (1 - weight);
  }

  return weight;
}

module.exports = distance;