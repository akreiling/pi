const Flexor = require('../flexor');

class Map extends Flexor {
}

module.exports = Map;

if (require.main === module) {
  // eslint-disable-next-line global-require
  const f = require('../../pi');

  const main = async () => {
    const n = parseInt(process.argv[0 + 2], 10);

    for (let p = 0; p < n; ++p) {
      const config = {
        sources: [`redis://localhost:6379/stream:partition:${p}`],
        sinks: [`redis://localhost:6379/stream:map:${p}`],
        f,
      };
      const flexor = new Map(config);
      flexor.start();
    }
  };

  main();
}
