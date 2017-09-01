const expect = require('chai').expect;
const coords = require('../server/coords');

const mock = [{
  set: [0, 0, 180, 180],
  result: 20015.086
}, {
  set: [180, 180, 0, 0],
  result: 20015.086
}, {
  set: [1, 2, 3, 4],
  result: 314.41
}, {
  set: [0, 0, 0, 0],
  result: 0
}, {
  set: [-15, -10, -12, -14],
  result: 546.19
}, {
  set: [90, 0, 0, 180],
  result: 17333.57
}]

describe('Distance calculation on lat, long pairs', () => {
  it('should compute distance correctly', () => {

    mock.forEach((p) => {
      const [l1, lo1, l2, lo2] = p.set;

      expect(coords.dist(l1, lo1, l2, lo2)).to.be.closeTo(p.result, 1);
    });

  });
});