const Flexor = require('../flexor');

class Generator extends Flexor {
}

module.exports = Generator;

if (require.main === module) {
  const main = async () => {
    const source = process.argv[0 + 2];
    const sink = process.argv[0 + 3];

    const config = {
      sources: [source],
      sinks: [sink],
    };

    let fn;
    if ((fn = process.argv[0 + 4])) {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      config.f = require(`../../${fn}`);
    }

    const flexor = new Generator(config);
    flexor.start();
  };

  main();
}
