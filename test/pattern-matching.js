var expect = require('chai').expect;
const jw = require('../server/jaro-winkler');


const known = [{
  // Prefix
  term: 'mont',
  match: 'Montreal',
  score: 0.9
}, {
  // Missing letters
  term: 'atens',
  match: 'Athens',
  score: 0.95
}, {
  // Bad match
  term: 'nopematch',
  match: 'London',
  score: 0.35
}, {
  // Bad letters and missing words
  term: 'newtork',
  match: 'New York City',
  score: 0.84
}, {
  // Missing letters
  term: 'mtrl',
  match: 'Montreal',
  score: 0.73
}, {
  // Misspelling
  term: 'Agdene',
  match: 'Ogden',
  score: 0.82
}, {
  // Severe transposition (very common with dyslexia)
  term: 'vacnuoer',
  match: 'Vancouver',
  score: 0.90
}, {
  // transposition, miss-spelling, missing letters
  term: 'Tmsmanig',
  match: 'Temiskaming',
  score: 0.84
}]

describe('Jaro-Winkler Pattern Matching', () => {
  it('should match known results', () => {
    known.forEach(kn => {
      expect(jw(kn.term, kn.match)).to.be.closeTo(kn.score, 0.02);
    });
  });
});