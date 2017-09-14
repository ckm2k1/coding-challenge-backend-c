const express = require('express');
const routes = require('./routes');

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
  const app = express();
  app.locals.cache = cache;
  app.use(express.static('public'));
  app.use(routes);
  app.listen(port);

  return app;
}