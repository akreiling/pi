const flexi = require('./flexi');

const f = ([x, y], state = { count: 0, total: 0 }) => {
  let { count, total } = state;

  if (x * x + y * y < 1.0) {
    count += 1;
  }
  total += 1;

  return [
    4.0 * (count / total),
    { count, total },
  ];
};

const main = async () => {
  const url = process.argv[0 + 2];

  flexi()
    .batch(url)
    .partition(4)
    .map(f)
    .avg();
};

main();
