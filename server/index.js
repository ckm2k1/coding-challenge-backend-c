const isDev = process.env.NODE_ENV === 'development';
const cluster = require('cluster');
const http = require('http');
const express = require('express');
const port = process.env.PORT || 2345;
const host = isDev ? '127.0.0.1' : '0.0.0.0';
const routes = require('./routes');
const config = require('./config');
const cache = isDev ? require('./cache') : require('memored');

isDev && console.log('Running in DEV mode');

// Let the OS determine worker scheduling.
// cluster.schedulingPolicy = cluster.SCHED_NONE;

const stats = {};
let total = 0;
if (cluster.isMaster && !isDev) {
	process.on('SIGINT', computeRequestStats);

	console.log(`Master ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < config.cpus; i++) {
		cluster.fork();
	}

	for (const id in cluster.workers) {
		stats[id] = 0;
    cluster.workers[id].on('message', function(id, msg) {
    	++stats[id], ++total;
    }.bind(null, id));
  }

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
} else {
	const app = express();
	app.locals.cache = cache;
	app.use(routes);

	const server = app.listen(port);
	console.log(`Worker ${process.pid} started, listening on ${port}`);
}

function computeRequestStats() {
	Object.keys(stats).map((key) => {
		return `Worker ${key} handled ${stats[key] / total * 100}% of the load`;
	})
	.map(console.log.bind(console));
}