const http = require('http');
const parse = require('csv-parse');

class HttpConsumer {
  constructor(flexor, uri) {
    this.url = uri.toString();
    this.eval = flexor.eval.bind(flexor);
    this.terminal = flexor.terminal.bind(flexor);
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
    parser.on('end', () => this.terminal(this.url));

    http.get(this.url, (res) => {
      res.pipe(parser);
      res.on('end', () => parser.end());
    });
  }

  stop() {
  }
}

module.exports = HttpConsumer;
