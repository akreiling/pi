const redis = require('redis');
const { promisifyAll } = require('bluebird');

promisifyAll(redis);

const clients = {};
const counts = {};

function createClient(host, port) {
  const key = `${host}:${port}`;
  if (!clients[key]) {
    const client = redis.createClient({ host, port });
    client.tryAndQuit = () => {
      counts[key] -= 1;
      if (counts[key] === 0) {
        client.quit();
      }
    };

    clients[key] = client;
    counts[key] = 0;
  }
  counts[key] += 1;

  return clients[key];
}

module.exports = {
  redis,
  createClient,
};
