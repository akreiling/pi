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
    const source = process.argv[0 + 2];
    const n = parseInt(process.argv[0 + 3], 10);
    const sink = process.argv[0 + 4];

    const f = (cache) => {
      const values = Object.values(cache);
      const pi = values.reduce((a, v) => a + v, 0.0) / values.length;
      return [pi];
    };

    const config = {
      sources: [],
      sinks: [sink],
      f,
    };
    for (let p = 0; p < n; ++p) {
      config.sources.push(`${source}:${p}`);
    }
    const flexor = new Fanin(config);
    flexor.start();
  };

  main();
}
