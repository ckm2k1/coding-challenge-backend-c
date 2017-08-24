const cluster = require('cluster');
const express = require('express');
const port = process.env.PORT || 2345;
const routes = require('./routes');
const config = require('./config');
const cache = config.isDev ? require('./cache') : require('memored');

config.isDev && console.log('Running in DEV mode');

// Let the OS determine worker scheduling.
// cluster.schedulingPolicy = cluster.SCHED_NONE;

const stats = {};
let total = 0;
if (cluster.isMaster && !config.isDev) {
	process.on('SIGINT', computeRequestStats);

	console.log(`Master ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < config.cpus; i++) {
		cluster.fork();
	}

	Object.values(cluster.workers).forEach((worker) => {
		stats[worker.id] = 0;
		worker.on('message', function(id) {
			++stats[id], ++total;
		}.bind(worker.id));
	});

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
} else {
	const app = express();
	app.locals.cache = cache;
	app.use(routes);

	app.listen(port);
	console.log(`Worker ${process.pid} started, listening on ${port}`);
}

function computeRequestStats() {
	return Object.keys(stats).map((key) => {
		return `Worker ${key} handled ${stats[key] / total * 100}% of the load\n`;
	})
	.map(console.log.bind(console));
}