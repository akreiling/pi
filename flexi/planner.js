const crypto = require('crypto');
const { spawn } = require('child_process');
const { redis } = require('./utils/redis');

class Planner {
  constructor() {
    this.id = crypto.randomUUID();
    this.commands = [];
    this.partitions = 1;
  }

  batch(uri) {
    const { id } = this;

    const args = [];
    args.push('./flexi/flexors/generator.js');

    args.push(uri);

    args.push(`redis://localhost:6379/stream:${id}:source:0`);

    this.commands.push(args);

    return this;
  }

  partition(n) {
    const { id, partitions } = this;

    for (let p = 0; p < partitions; ++p) {
      const args = [];
      args.push('./flexi/flexors/fanout.js');

      args.push(`redis://localhost:6379/stream:${id}:source:${p}`);

      args.push(`redis://localhost:6379/stream:${id}:partition`);
      args.push(n);

      this.commands.push(args);
    }
    this.partitions = n;

    return this;
  }

  map(f) {
    const { id, partitions } = this;

    for (let p = 0; p < partitions; ++p) {
      const args = [];
      args.push('./flexi/flexors/map.js');

      args.push(`redis://localhost:6379/stream:${id}:partition:${p}`);

      args.push(f);

      args.push(`redis://localhost:6379/stream:${id}:map:${p}`);

      this.commands.push(args);
    }

    return this;
  }

  avg() {
    const { id, partitions } = this;

    for (let p = 0; p < 1; ++p) {
      const args = [];
      args.push('./flexi/flexors/fanin.js');

      args.push(`redis://localhost:6379/stream:${id}:map`);
      args.push(partitions);

      args.push(`redis://localhost:6379/stream:${id}:collect:${p}`);

      this.commands.push(args);
    }

    this.partitions = 1;
    return this;
  }

  start() {
    let child;
    this.commands.forEach((args) => {
      console.log('execing: node', args.join(' '));
      child = spawn('node', args, { stdio: 'inherit' });
    });

    const client = redis.createClient();
    const interval = setInterval(async () => {
      const res = await client.xrevrangeAsync(`stream:${this.id}:collect:0`, '+', '-', 'COUNT', 2);
      console.log(res);
      if (child.exitCode !== null) {
        clearInterval(interval);
        client.quit();
      }
    }, 250);
  }
}

module.exports = () => new Planner();
