const http = require('http');
const os = require("os");
const cluster = require("cluster");
const { Telegraf } = require('telegraf');

const token = '1691713249:AAG6g1uwDsNs6aaI6uX6GQEOnWX5zaXjKwc';
const bot = new Telegraf(token);
const PORT = 8100;

const clusterWorkerSize = os.cpus().length;

bot.telegram.setWebhook("https://api.queuebot.me");

bot.on('text', (ctx) => {
    ctx.reply("fck u");
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
        console.log(`Express server listening on port ${PORT} and worker ${process.pid}`);
    }
} else {
    http.createServer(bot.webhookCallback('/')).listen(8100, '127.0.0.1');
    console.log(`Express server listening on port ${PORT} with the single worker ${process.pid}`);
}
