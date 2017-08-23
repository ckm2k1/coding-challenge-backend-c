const express = require('express');
const suggestionsRouter = express.Router();
const db = new (require('./db'))();
const cache = require('./cache');
const config = require('./config');
const os = require('os');
db.load();

suggestionsRouter.get('/suggestions', (req, res) => {
  const {q: query, lat, long, ['use-cache']: useCache = true, limit = config.search.minResults} = req.query;

  if (!query) {
    res.status(400);
    return res.end(JSON.stringify({
      error: 'Empty query'
    }));
  }

  const cacheKey = cache.genKey(query, lat, long, limit);

  let output;
  if (cache.exists(cacheKey) && !(useCache === 'false')) {
    output = cache.get(cacheKey);
  } else {
    output = {suggestions: db.search(query, parseFloat(lat), parseFloat(long)).slice(0, limit)};

    output.suggestions = output.suggestions.map((sug) => {
      return {
        id: sug.id,
        name: sug.name,
        lat: sug.latitude,
        lang: sug.longitude,
        stateOrProvince: sug.adminCodeUtf8,
        country: sug.country,
        distance: sug.distance,
        population: sug.population,
        score: sug.score
      }
    });

    cache.set(cacheKey, output);
  }

  res.status(output.suggestions.length ? 200 : 404);
  return res.json(output);
});

suggestionsRouter.get('/machine-stats', (req, res) => {
  res.json({
    mem: process.memoryUsage(),
    cpus: config.cpus,
    uptime: process.uptime(),
    cpuUsageTIme: process.cpuUsage(),
    systemMem: {
      freem: os.freemem() / 1e6,
      total: os.totalmem() / 1e6
    },
    load: os.loadavg()
  });
})

module.exports = suggestionsRouter;