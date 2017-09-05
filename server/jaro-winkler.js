module.exports = function distance(s1, s2, caseSensitive = false) {
  var matchingChars = 0;
  var s1Length = s1.length;
  var s2Length = s2.length;
  var shortestLength = Math.min(s1Length, s2Length);

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

  var range = (Math.floor(Math.max(s1Length, s2Length) / 2)) - 1;
  var s1Matches = new Array(s1Length);
  var s2Matches = new Array(s2Length);

  for (let i = 0; i < s1Length; i++) {
    var low  = (i >= range) ? i - range : 0;
    var high = (i + range <= (s2Length - 1)) ? (i + range) : (s2Length - 1);

    for (let j = low; j <= high; j++) {
      if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
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
  var k = 0;
  var numTrans = 0;

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
  // console.log(numTrans);

  var weight = (matchingChars / s1Length + matchingChars / s2Length + (matchingChars - (numTrans / 2)) / matchingChars) / 3;
  var l;
  var p = 0.1;

  if (weight > 0.7) {
    var smaller = shortestLength >= 4 ? 4 : shortestLength;
    for(l = 0; (l < smaller) && (s1[l] === s2[l]); l++);

    if (l) {
      weight += l * p * (1 - weight);
    }
  }

  return weight;
}
