const Flexor = require('../flexor');

class Fanout extends Flexor {
}

module.exports = Fanout;

if (require.main === module) {
  const main = async () => {
    const n = parseInt(process.argv[0 + 2], 10);

    const config = {
      sources: ['redis://localhost:6379/stream:source'],
      sinks: [],
    };
    for (let p = 0; p < n; ++p) {
      config.sinks.push(`redis://localhost:6379/stream:partition:${p}`);
    }
    const flexor = new Fanout(config);
    flexor.start();
  };

  main();
}
