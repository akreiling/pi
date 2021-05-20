const Flexor = require('./flexor');
const Fanout = require('./flexors/fanout');
const Fanin = require('./flexors/fanin');
const Map = require('./flexors/map');

class Planner {
  constructor() {
    this.flexors = [];
    this.partitions = 1;
  }

  batch(uri) {
    const config = {
      sources: [uri],
      sinks: ['redis://localhost:6379/stream:source'],
    };
    const flexor = new Flexor(config);
    this.flexors.push(flexor);

    return this;
  }

  partition(n) {
    const config = {
      sources: ['redis://localhost:6379/stream:source'],
      sinks: [],
    };
    for (let p = 0; p < n; ++p) {
      config.sinks.push(`redis://localhost:6379/stream:partition:${p}`);
    }
    const flexor = new Fanout(config);
    this.flexors.push(flexor);
    this.partitions = n;

    return this;
  }

  map(f) {
    for (let p = 0; p < this.partitions; ++p) {
      const config = {
        sources: [`redis://localhost:6379/stream:partition:${p}`],
        sinks: [`redis://localhost:6379/stream:map:${p}`],
        f,
      };
      const flexor = new Map(config);
      this.flexors.push(flexor);
    }

    return this;
  }

  avg() {
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
    for (let p = 0; p < this.partitions; ++p) {
      config.sources.push(`redis://localhost:6379/stream:map:${p}`);
    }
    const flexor = new Fanin(config);
    this.flexors.push(flexor);

    return this;
  }

  start() {
    this.flexors.forEach((f) => f.start());
  }
}

module.exports = () => new Planner();
