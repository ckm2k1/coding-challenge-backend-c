const express = require('express');
const suggestionsRouter = express.Router();
const db = new (require('./db'))();
db.load();

suggestionsRouter.get('/suggestions', (req, res) => {
  const {q, latitude, longitude} = req.query;

  if (!q) {
    res.status(400);
    return res.end(JSON.stringify({
      error: 'Empty query'
    }));
  }

  const sug = db.search(q);
  const output = JSON.stringify({suggestions: sug.slice(0, 20)}, null, 2);

  res.status(sug.length ? 200 : 404);
  return res.end(output);
});

module.exports = suggestionsRouter;