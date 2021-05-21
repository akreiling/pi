const Flexor = require('../flexor');

class Fanin extends Flexor {
  constructor(config = {}) {
    super(config);

    this.cache = {};
  }

  eval(data, key) {
    this.cache[key] = data;
    super.eval(this.cache);
  }
}

module.exports = Fanin;

if (require.main === module) {
  const main = async () => {
    const n = parseInt(process.argv[0 + 2], 10);

    const f = (cache) => {
      const values = Object.values(cache);
      const pi = values.reduce((a, v) => a + v, 0.0) / values.length;
      return [pi];
    };

    const config = {
      sources: [],
      sinks: ['redis://localhost:6379/stream:collect'],
      f,
    };
    for (let p = 0; p < n; ++p) {
      config.sources.push(`redis://localhost:6379/stream:map:${p}`);
    }
    const flexor = new Fanin(config);
    flexor.start();
  };

  main();
}
