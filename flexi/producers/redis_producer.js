const redis = require('../utils/redis');

class RedisProducer {
  constructor(flexor, uri) {
    this.url = uri.toString();
    this.host = uri.hostname;
    this.port = uri.port;
    this.key = uri.pathname.slice(1);

    this.client = redis.createClient(this.host, this.port);
    this.batcher = this.client.batch();
    this.counter = 0;
  }

  start() {
    console.log('starting producer', this.url);
    this.client.del(this.key);
  }

  terminal() {
    console.log('terminal producer', this.url);
    const args = [this.key, '*', 'state', 'TERMINAL'];
    this.client.batch().xadd(args).exec();
  }

  stop() {
    this.client.tryAndQuit();
  }

  async emit(data) {
    this.counter += 1;
    const { client, counter, batcher } = this;

    const id = `${counter}-0`;
    const args = [this.key, id, 'data', JSON.stringify(data)];
    batcher.xadd(args);

    if (counter % 50 === 0) {
      batcher.exec((err) => {
        if (err) {
          console.log('ERR', err);
          process.exit();
        }
      });
      this.batcher = client.batch();
    }

    if (counter % 100000 === 0) {
      console.log(id, client.command_queue_length, data);
    }

    while (client.command_queue_length > 100000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return true;
  }
}

module.exports = RedisProducer;
