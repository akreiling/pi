const axios = require('axios');
const parse = require('csv-parse');

class HttpConsumer {
  constructor(flexor, uri) {
    this.url = uri.toString();
    this.eval = flexor.eval.bind(flexor);
    this.terminal = flexor.terminal.bind(flexor);
  }

  async start() {
    console.log('starting consumer', this.url);

    const response = await axios.request({
      method: 'GET',
      url: this.url,
      responseType: 'stream',
    });
    const parser = response.data.pipe(parse({ delimiter: ',' }));
    for await (const record of parser) {
      await this.eval(record, this.url);
    }

    parser.end();
    this.terminal(this.url);
  }

  stop() {
  }
}

module.exports = HttpConsumer;
