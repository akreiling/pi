const f = ([x, y]) => x * x + y * y < 1;

module.exports = f;

if (require.main === module) {
  console.assert(f([0, 0]) === true);
  console.assert(f([0.5, 0.5]) === true);
  console.assert(f([0.75, 0.75]) === false);
  console.assert(f([1, 1]) === false);
}
