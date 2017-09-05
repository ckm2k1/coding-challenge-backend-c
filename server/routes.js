const express = require('express');
const suggestionsRouter = express.Router();
const db = new (require('./db'))();
const cache = require('./cache');
const config = require('./config');
const os = require('os');
db.load();

suggestionsRouter.get('/suggestions', (req, res, next) => {
  const {q: query, lat, long, ['use-cache']: useCache = true, limit = config.search.minResults} = req.query;

  if (!query) {
    throw new Error('Empty query');
  }

  Object.assign(res.locals, {query, lat, long, useCache, limit});

  res.locals.cacheKey = cache.genKey(query, lat, long, limit);

  if (useCache === true) {
    req.app.locals.cache.read(res.locals.cacheKey, (err, cachedValue) => {
      return cachedValue ?
        sendResponse(res, cachedValue).end() :
        next();
    });
  } else return next();
}, async (req, res) => {
  const { query, lat, long, limit, cacheKey } = res.locals;

  const output = await searchDB(query, lat, long, limit);

  req.app.locals.cache.store(cacheKey, output);
  sendResponse(res, output).end();
}, (err, req, res, next) => {
  if (err.message === 'Empty query') {
    res.status(404);
    return res.json({
      error: err.message
    });
  }

  res.status(500);
  res.end();
});

async function searchDB(query, lat, long, limit) {
  const results = await db.search(query, parseFloat(lat), parseFloat(long));
  const output = { suggestions: results.slice(0, limit) };

    output.suggestions = output.suggestions.map((sug) => {
      return {
        id: sug.id,
        name: sug.name,
        asciiname: sug.asciiname,
        lat: sug.latitude,
        long: sug.longitude,
        stateOrProvince: sug.adminCodeUtf8,
        country: sug.country,
        distance: sug.distance,
        population: sug.population,
        score: sug.score,
        comps: sug.comps
      }
    });

    return output;
}

function sendResponse(res, output) {
  // Close connections immediately since
  // we won't have any futher interaction with
  // the client and we want to hurry up and move
  // on to the next request.
  res.setHeader('Connection', 'close');

  res.status(output.suggestions.length ? 200 : 404);
  return res.json(output);
}

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

suggestionsRouter.get('/worker-stats', (req, res) => {
  process.send({type: 'print-stats'});
  res.end();
});

module.exports = suggestionsRouter;