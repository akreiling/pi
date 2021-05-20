const redis = require('../utils/redis');

class RedisProducer {
  constructor(flexor, uri) {
    this.url = uri.toString();
    this.host = uri.hostname;
    this.port = uri.port;
    this.key = uri.pathname.slice(1);

    this.client = redis.createClient(this.host, this.port);
  }

  start() {
    console.log('starting producer', this.url);
    this.client.xtrim(this.key, 'MAXLEN', 0);
  }

  terminal() {
    console.log('terminal producer', this.url);
    const args = [this.key, '*', 'state', 'TERMINAL'];
    this.client.xadd(args);
  }

  stop() {
    this.client.tryAndQuit();
  }

  emit(data) {
    const args = [this.key, '*', 'data', JSON.stringify(data)];
    this.client.xadd(args);
  }
}

module.exports = RedisProducer;
