const redis = require('../utils/redis');

class RedisConsumer {
  constructor(flexor, uri) {
    this.url = uri.toString();

    this.host = uri.hostname;
    this.port = uri.port;
    this.key = uri.pathname.slice(1);

    this.client = redis.createClient(this.host, this.port);

    this.eval = flexor.eval.bind(flexor);
  }

  run(id = '0-0') {
    this.client.xread('BLOCK', 10, 'STREAMS', this.key, id,
      (err, res) => {
        let new_id = id;
        let payload;

        if (res !== null) {
          res[0][1].forEach((message) => {
            [new_id, payload] = message;
            this.eval(JSON.parse(payload[1]), this.url);
          });
        }
        setTimeout(() => this.run(new_id), 0);
      });
  }

  start() {
    console.log('starting consumer', this.url);

    this.run();
  }

  stop() {
    this.client.quit();
  }
}

module.exports = RedisConsumer;
