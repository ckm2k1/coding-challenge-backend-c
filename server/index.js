const http = require('http');
const express = require('express');
const port = process.env.PORT || 2345;
const routes = require('./routes');

const app = express();
app.use(routes);

app.listen(port);


module.exports = app;

console.log('Server running at http://127.0.0.1:%d/suggestions', port);