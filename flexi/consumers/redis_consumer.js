const redis = require('../utils/redis');

class RedisConsumer {
  constructor(flexor, uri) {
    this.url = uri.toString();

    this.host = uri.hostname;
    this.port = uri.port;
    this.key = uri.pathname.slice(1);

    this.client = redis.createClient(this.host, this.port);

    this.eval = flexor.eval.bind(flexor);
    this.terminal = flexor.terminal.bind(flexor);
  }

  run(id = '0-0') {
    this.client.xread('BLOCK', 10, 'STREAMS', this.key, id,
      (err, res) => {
        let new_id = id;
        let payload;

        if (err) {
          console.log(err);
          process.exit(1);
        }

        if (res !== null) {
          res[0][1].forEach((message) => {
            [new_id, [, payload]] = message;
            if (payload === 'TERMINAL') {
              this.terminal(this.url);
            } else {
              this.eval(JSON.parse(payload), this.url);
            }
          });
        }

        if (this.is_terminal) {
          this.client.tryAndQuit();
        } else {
          setTimeout(() => this.run(new_id), 0);
        }
      });
  }

  start() {
    console.log('starting consumer', this.url);

    this.run();
  }

  stop() {
    this.is_terminal = true;
  }
}

module.exports = RedisConsumer;
