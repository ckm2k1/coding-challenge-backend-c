// All credit to Jordan Thomas.
// Base implmentation taken from here: https://github.com/jordanthomas/jaro-winkler/blob/master/index.js
//
// Changes made specifically for this app:
// 1. Original implementation adds prefix scoring for any word length, fixed to a minimum of 4 chars.
// 2. Removed support for options object.
// 3. Switch prefix boost loop for tighter for loop.
// 4. Swap vars for 'const' and 'let'
// 5. Lenghts are const.
module.exports = function distance(s1, s2, caseSensitive = false) {
  let matchingChars = 0;
  const s1Length = s1.length;
  const s2Length = s2.length;
  const shortestLength = Math.min(s1Length, s2Length);

  // Exit early if either are empty.
  if (s1Length === 0 || s2Length === 0) {
    return 0;
  }

  // Convert to upper if case-sensitive is false.
  if (!caseSensitive) {
    s1 = s1.toUpperCase();
    s2 = s2.toUpperCase();
  }

  // Exit early if they're an exact match.
  if (s1 === s2) {
    return 1;
  }

  const range = (Math.floor(Math.max(s1Length, s2Length) / 2)) - 1;
  const s1Matches = new Array(s1Length);
  const s2Matches = new Array(s2Length);

  for (let i = 0; i < s1Length; i++) {
    const low  = (i >= range) ? i - range : 0;
    const high = (i + range <= (s2Length - 1)) ? (i + range) : (s2Length - 1);

    for (let j = low; j <= high; j++) {
      if (s2Matches[j] !== true && s1[i] === s2[j]) {
        ++matchingChars;
        s1Matches[i] = s2Matches[j] = true;
        break;
      }
    }
  }

  // Exit early if no matches were found.
  if (matchingChars === 0) {
    return 0;
  }

  // Count the transpositions.
  let k = 0;
  let numTrans = 0;

  for (let i = 0; i < s1Length; i++) {
    if (s1Matches[i] === true) {
      let j;
      for (j = k; j < s2Length; j++) {
        if (s2Matches[j] === true) {
          k = j + 1;
          break;
        }
      }

      if (s1[i] !== s2[j]) {
        ++numTrans;
      }
    }
  }

  let weight = (matchingChars / s1Length + matchingChars / s2Length + (matchingChars - (numTrans / 2)) / matchingChars) / 3;
  let l;
  const p = 0.1;

  if (weight > 0.7) {
    var smaller = shortestLength >= 4 ? 4 : shortestLength;
    for(l = 0; (l < smaller) && (s1[l] === s2[l]); l++);

    if (l) {
      weight += l * p * (1 - weight);
    }
  }

  return weight;
}
