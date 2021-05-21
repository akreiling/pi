const Flexor = require('../flexor');

class Generator extends Flexor {
}

module.exports = Generator;

if (require.main === module) {
  const main = async () => {
    const uri = process.argv[0 + 2];

    const config = {
      sources: [uri],
      sinks: ['redis://localhost:6379/stream:source'],
    };
    const flexor = new Generator(config);
    flexor.start();
  };

  main();
}
