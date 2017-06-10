const cluster = require('cluster');
const http = require('http');
//const numCPUs = require('os').cpus().length;
const numCPUs = 2;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    let debugItem = process.execArgv.find(c => c.indexOf('--inspect') !== -1),
        debug = (debugItem !== undefined),
        port = debug === true ? Number(debugItem.split('=')[1]) : undefined;

    cluster.schedulingPolicy = cluster.SCHED_RR;    

    for (var i = 1; i <= numCPUs; ++i) {
        let argv = ['index.js'];
        if (debug) {
            argv = [`--inspect=${port}`, '--debug-brk', 'index.js'];

        }

        cluster.setupMaster({
            execArgv: argv
        });

        cluster.fork();
        if (debug) {
            cluster.settings.execArgv.pop();
            cluster.settings.execArgv.pop();
        }
    }


    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
}
else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    http.createServer((req, res) => {
        console.log(`${process.pid} Called`);
        res.writeHead(200);
        res.end(`hello world + ${process.pid}\n`);
    }).listen(8080);

    console.log(`Worker ${process.pid} started`);
}

