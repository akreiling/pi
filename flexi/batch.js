const http = require('http');
const parse = require('csv-parse');

const s3 = (uri) => (emit, done) => {
  const url = uri.replace('s3://', 'http://s3.amazonaws.com/');
  console.log(url);

  const parser = parse({ delimiter: ',' });
  parser.on('readable', () => {
    let record;
    while ((record = parser.read())) {
      emit(record);
    }
  });
  parser.on('end', () => done && done());

  http.get(url, (res) => {
    res.on('data', (chunk) => parser.write(chunk));
    res.on('end', () => {
      emit('TERMINAL');
      parser.end();
    });
  });
};

module.exports = s3;

if (require.main === module) {
  const url = process.argv[0 + 2];
  console.log('processing', url);
  let n = 0;
  const f = s3(url);
  f(
    () => (n += 1),
    () => console.log('processed', n, 'records'),
  );
}
