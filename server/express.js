const express = require('express');
const routes = require('./routes');

module.exports.init = function(cache, port) {
  const app = express();
  app.locals.cache = cache;
  app.use(express.static('public'));
  app.use(routes);

  app.listen(port);
  console.log(`Worker ${process.pid} started, listening on ${port}`);

  return app;
}