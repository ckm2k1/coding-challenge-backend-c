const cluster = require('cluster');
const http = require('http');
const express = require('express');
const port = process.env.PORT || 2345;
const routes = require('./routes');
const config = require('./config');

// module.exports = app;

// console.log('Server running at http://127.0.0.1:%d/suggestions', port);

if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < config.cpus; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
} else {
	const app = express();
	app.use(routes);
	app.listen(port);

	console.log(`Worker ${process.pid} started`);
}