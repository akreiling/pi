const HttpConsumer = require('./http_consumer');

class S3Consumer extends HttpConsumer {
  constructor(flexor, uri) {
    const url = `http://s3.amazonaws.com/${uri.host}${uri.pathname}`;
    super(flexor, new URL(url));
  }
}

module.exports = S3Consumer;
