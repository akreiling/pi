const RedisConsumer = require('./consumers/redis_consumer');
const S3Consumer = require('./consumers/s3_consumer');
const RedisProducer = require('./producers/redis_producer');

const defaults = {
  sources: [],
  sinks: [],
  f: (v) => [v],
};

class Flexor {
  constructor(config = {}) {
    this.config = { ...defaults, ...config };

    this.buildConsumers();
    this.buildProducers();

    this.f = this.config.f.bind(this);

    this.partition = 0;
  }

  buildConsumers() {
    this.consumers = this.config.sources.map((source) => {
      console.log('building source', source);

      const uri = new URL(source);

      switch (uri.protocol) {
        case 's3:':
          return new S3Consumer(this, uri);
        case 'redis:':
          return new RedisConsumer(this, uri);
        default:
          throw new Error(`Unsupported URI protocol: ${uri.protocol}`);
      }
    });
  }

  buildProducers() {
    this.producers = this.config.sinks.map((sink) => {
      console.log('building sink', sink);

      const uri = new URL(sink);

      switch (uri.protocol) {
        case 'redis:':
          return new RedisProducer(this, uri);
        default:
          throw new Error(`Unsupported URI protocol: ${uri.protocol}`);
      }
    });
  }

  start() {
    this.producers.forEach((p) => p.start());
    this.consumers.forEach((c) => c.start());
  }

  done() {
    console.log('done');
  }

  stop() {
    console.log('stop');
  }

  eval(data) {
    const { state } = this;
    let result;
    let new_state;

    if (state) {
      [result, new_state] = this.f(data, state);
    } else {
      [result, new_state] = this.f(data);
    }

    this.producers[this.partition].emit(result);
    this.partition = (this.partition + 1) % this.producers.length;
    this.state = new_state;
  }
}

module.exports = Flexor;
