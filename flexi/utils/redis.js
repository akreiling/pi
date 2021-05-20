const redis = require('redis');

const clients = {};

function createClient(host, port) {
  const key = `${host}:${port}`;
  if (!clients[key]) {
    clients[key] = redis.createClient({ host, port });
  }
  return clients[key];
}

module.exports = {
  createClient,
};
