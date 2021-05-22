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

  async read(id) {
    const res = await this.client.xreadAsync('COUNT', 50, 'BLOCK', 10, 'STREAMS', this.key, id);

    let new_id = id;
    let payload;

    if (res !== null) {
      for await (const message of res[0][1]) {
        [new_id, [, payload]] = message;
        if (payload === 'TERMINAL') {
          this.terminal(this.url);
        } else {
          await this.eval(JSON.parse(payload), this.url);
        }
      }
    }

    return new_id;
  }

  async run() {
    let id = '0-0';
    do {
      // eslint-disable-next-line no-await-in-loop
      id = await this.read(id);
    } while (!this.is_terminal);

    console.log('terminal consumer', this.url);
    this.client.tryAndQuit();
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
