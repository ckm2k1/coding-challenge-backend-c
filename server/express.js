// const express = require('express');
const routes = require('./routes');
const http = require('http');

/**
 * Initializes the express server and start
 * listening for connections.
 *
 * @param {object} cache An instance of Memored or our own cache module.
 * @param {integer} port Port number to listen on.
 *
 * @return {Express} The express app instance.
 */
module.exports.init = function(cache, port) {
  const server = http.createServer(routes.bind(null, cache));

  server.listen(port, '0.0.0.0');

  return server;
}