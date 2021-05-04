const http = require('http');
const os = require("os");
const cluster = require("cluster");
const { Telegraf } = require('telegraf');
const jacobi = require('./scripts/jacobi.js');

const token = '1691713249:AAG6g1uwDsNs6aaI6uX6GQEOnWX5zaXjKwc';
const bot = new Telegraf(token);

const clusterWorkerSize = os.cpus().length;

bot.telegram.setWebhook("https://api.queuebot.me");

bot.on('text', (ctx) => {
    var s = ctx.message.text;
    const ss = s.split(' ')
    if(ss[0] === "Jacobi" || ss[0]==="jacobi"){
        var m1=parseInt(ss[1])
        var n1=parseInt(ss[2])

        s = jacobi.jac(m1, n1)
    }
    ctx.reply(s)
    s = ""
})

if (clusterWorkerSize > 1) {
    if (cluster.isMaster) {
        for (let i=0; i < clusterWorkerSize; i++) {
            cluster.fork()
        }

        cluster.on("exit", function(worker) {
            console.log("Worker", worker.id, " has exitted.")
        })
    } else {

        http.createServer(bot.webhookCallback('/')).listen(8100, '127.0.0.1');
        console.log(`Express server listening on port 8100 and worker ${process.pid}`);
    }
} else {
    http.createServer(bot.webhookCallback('/')).listen(8100, '127.0.0.1');
    console.log(`Express server listening on port 8100 with the single worker ${process.pid}`);
}
