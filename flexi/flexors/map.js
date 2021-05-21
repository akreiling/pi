const Flexor = require('../flexor');

class Map extends Flexor {
}

module.exports = Map;

if (require.main === module) {
  const main = async () => {
    const source = process.argv[0 + 2];
    const sink = process.argv[0 + 4];

    // eslint-disable-next-line global-require,import/no-dynamic-require
    const f = require('../../' + process.argv[0 + 3]);

    const config = {
      sources: [source],
      sinks: [sink],
      f,
    };
    const flexor = new Map(config);
    flexor.start();
  };

  main();
}
