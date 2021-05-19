// given a list of random points between [-1.0, -1.0] and [1.0, 1.0]
// estimate the value of pi

const f = ([x, y], state = { count: 0, total: 0 }) => {
  // decompose state
  let { count, total } = state;

  // increment count if the point inside the circle
  if (x * x + y * y < 1.0) {
    count += 1;
  }

  // increment the total count
  total += 1;

  // calculate current estimate of pi
  const pi = 4.0 * (count / total);

  // return value and new state
  return [pi, { count, total }];
};

module.exports = f;
