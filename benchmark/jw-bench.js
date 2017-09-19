var distance = require('./jw');
var data = require('../data/cities.json');
var term = 'mont';
console.time('js');
for(let i = 0; i < data.length; i++) {
  distance(term, data[i].asciiname);
}
console.timeEnd('js');
