class Planner {
  constructor() {
    this.commands = [];
    this.partitions = 1;
  }

  batch(uri) {
    const args = [];
    args.push('node');
    args.push('./flexi/flexors/generator.js');

    args.push(uri);

    args.push('redis://localhost:6379/stream:source:0');

    this.commands.push(args.join(' '));

    return this;
  }

  partition(n) {
    const { partitions } = this;

    for (let p = 0; p < partitions; ++p) {
      const args = [];
      args.push('node');
      args.push('./flexi/flexors/fanout.js');

      args.push(`redis://localhost:6379/stream:source:${p}`);

      args.push('redis://localhost:6379/stream:partition');
      args.push(n);

      this.commands.push(args.join(' '));
    }
    this.partitions = n;

    return this;
  }

  map(f) {
    const { partitions } = this;

    for (let p = 0; p < partitions; ++p) {
      const args = [];
      args.push('node');
      args.push('./flexi/flexors/map.js');

      args.push(`redis://localhost:6379/stream:partition:${p}`);

      args.push(f);

      args.push(`redis://localhost:6379/stream:map:${p}`);

      this.commands.push(args.join(' '));
    }

    return this;
  }

  avg() {
    const { partitions } = this;

    for (let p = 0; p < 1; ++p) {
      const args = [];
      args.push('node');
      args.push('./flexi/flexors/fanin.js');

      args.push('redis://localhost:6379/stream:map');
      args.push(partitions);

      args.push(`redis://localhost:6379/stream:collect:${p}`);

      this.commands.push(args.join(' '));
    }

    this.partitions = 1;
    return this;
  }

  start() {
    this.commands.forEach((cmd) => console.log(cmd));
  }
}

module.exports = () => new Planner();
