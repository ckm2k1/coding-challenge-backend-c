const cluster = require('cluster');
const port = process.env.PORT || 2345;
const config = require('./config');
const cache = config.isDev ? require('./cache') : require('memored');
const app = require('./express');

config.isDev && console.log('Running in DEV mode');

// Let the OS determine worker scheduling.
cluster.schedulingPolicy = cluster.SCHED_NONE;

const stats = {};
let total = 0;
if (cluster.isMaster && !config.isDev) {
	process.on('SIGUSR1', handleStatsRequest);

	console.log(`Master ${process.pid} is running`);

	for (let i = 0; i < config.cpus; i++) {
		// Init the stats object for workers.
		stats[cluster.fork().id] = 0;
	}

	// Register cluster events.
	cluster.on('message', (worker, msg) => {
		if (msg.type === 'print-stats') {
				return handleStatsRequest();
			}

			++stats[worker.id], ++total;
	});

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died with ${signal || code}`);
		cluster.fork();
	});

	cluster.on('listening', (worker, address) => {
		console.log(`Worker ${worker.process.pid} started, listening on ${address.port}`);
	});
} else {
	app.init(cache, port);
}

function displayRequestStats() {
	for(let [key, val] of Object.entries(stats)) {
		console.log(`Worker ${key} handled ${(val / total * 100) || 0}% of the load`);
	}
}

function handleStatsRequest() {
	displayRequestStats();

	const alive = Object.keys(cluster.workers).filter(w => !cluster.workers[w].isDead()).length;
	console.log('Workers alive:', alive);
}