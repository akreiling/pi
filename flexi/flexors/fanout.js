const Flexor = require('../flexor');

class Fanout extends Flexor {
}

module.exports = Fanout;

if (require.main === module) {
  const main = async () => {
    const source = process.argv[0 + 2];
    const sink = process.argv[0 + 3];
    const n = parseInt(process.argv[0 + 4], 10);

    const config = {
      sources: [source],
      sinks: [],
    };
    for (let p = 0; p < n; ++p) {
      config.sinks.push(`${sink}:${p}`);
    }
    const flexor = new Fanout(config);
    flexor.start();
  };

  main();
}
