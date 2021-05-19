const flexi = require('./flexi');
const pi = require('./pi');

const main = async () => {
  const url = process.argv[0 + 2];

  flexi()
    .batch(url)     // ingest a batch file into a stream
    .partition(4)   // split stream into an arbitrary number of partitions
    .map(pi)        // map every value by user provided function
    .avg();         // calculate running average across the stream partitions
};

main();
