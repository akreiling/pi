const http = require('http');
const parse = require('csv-parse');

const f = (url, emit, done) => {
  const parser = parse({ delimiter: ',' });
  parser.on('readable', () => {
    let record;
    while (record = parser.read()) {
      emit(record);
    }
  });
  parser.on('end', () => done && done());

  http.get(url, (res) => {
    res.on('data', (chunk) => parser.write(chunk));
    res.on('end', () => parser.end());
  });
};
module.exports = f;

if (require.main === module) {
  const url = process.argv[0 + 2];
  console.log('processing', url);
  let n = 0;
  f(url, () => {
    n += 1;
  });
  console.log('processed', n, 'records');
}
