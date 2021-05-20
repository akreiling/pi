const http = require('http');
const parse = require('csv-parse');

class HttpConsumer {
  constructor(flexor, uri) {
    this.url = uri.toString();
    this.eval = flexor.eval.bind(flexor);
    this.done = flexor.done.bind(flexor);
  }

  start() {
    console.log('starting consumer', this.url);

    const parser = parse({ delimiter: ',' });
    parser.on('readable', () => {
      let record;
      while ((record = parser.read())) {
        this.eval(record, this.url);
      }
    });
    parser.on('end', () => this.done());

    http.get(this.url, (res) => {
      res.on('data', (chunk) => parser.write(chunk));
      res.on('end', () => parser.end());
    });
  }

  stop() {
  }
}

module.exports = HttpConsumer;
