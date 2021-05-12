const http = require('http');
const os = require("os");
const cluster = require("cluster");
const { exec } = require('child_process');
const { Telegraf } = require('telegraf');
const jacobi = require('./scripts/jacobi.js');
const latex = require('./scripts/latex.js')
const basic = require('./scripts/basic.js')
const fs = require('fs')

const token = '1681110137:AAEmEwDuJFK-lps4pD4uL6LKPrSE3zRtACI';
const bot = new Telegraf(token);
const clusterWorkerSize = os.cpus().length;

const whitelist = [
    341421484,
    497327654
];

var dir = "/home/queuebot/api.queuebot.me/temp/"

var images = [];

bot.telegram.setWebhook("https://api.queuebot.me");

function getMessage(path) {
    return fs.readFileSync(`messages/${path}`, 'utf8');
}

bot.start((ctx) => {
    ctx.reply(getMessage('start.txt'));
});

bot.help((ctx) => {
    ctx.reply(getMessage('help.txt'));
});

bot.on('text', async(ctx) => {

    var dir = `/home/queuebot/api.queuebot.me/temp/${ctx.message.from.id}`;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    var id = ctx.message.from.id

    var s = ctx.message.text

    var ss = s.split(' ')
    if(whitelist.includes(id)){
        switch(ss[0].toLowerCase()){
            case "gcd":
                var m1 = parseInt(ss[1])
                var n1 = parseInt(ss[2])
                if((m1 > 1) && (n1 > 1)) {
                    s = basic.display_ea(m1, n1)
                    await latex.writetex(id, s)
                    await latex.compile(id);
                    await ctx.replyWithPhoto({source: `temp/${ctx.message.from.id}/solving1.png`})
                }else ctx.reply("Введи нормальні числа")
                break;
            case "jacobi":
                var m1 = parseInt(ss[1])
                var n1 = parseInt(ss[2])
                if((m1 > 1) && (n1 > 2) && (n1 % 2 != 0)) {
                    s = jacobi.jac_custom(m1, n1)
                    await latex.writetex(id, s.s)
                    await latex.compile(id);
                    await ctx.replyWithPhoto({source: `temp/${ctx.message.from.id}/solving1.png`})

                }else ctx.reply("Введи нормальні числа")
                break;
            case "rootmod":
                //ctx.reply("rootmod")
                var a = parseInt(ss[1])
                var p = parseInt(ss[2])
                if((a > 0) && (p > 2)){
                    if(basic.prime(p)){
                        jacs = jacobi.jac_custom(a, p)
                        //latex.wts(ctx.message.from.id, jacs.s)
                        ctx.reply(`${jacs.res} ${a} ${p}`)
                        await exec(`/home/queuebot/api.queuebot.me/scripts/cpp/dm/rootmod ${jacs.res} ${a} ${p} /home/queuebot/api.queuebot.me/temp/${id}/solving1.tex`);
                        var data = fs.readFileSync(`/home/queuebot/api.queuebot.me/temp/${id}/solving1.tex`, 'utf8');
                        jacs.s += data;
                        latex.wts(ctx.message.from.id, jacs.s)
                        await latex.compile(id);
                        await ctx.replyWithPhoto({source: `temp/${ctx.message.from.id}/solving1.png`})

                    } else ctx.reply(`${p}-не просте`)
                }else{
                    ctx.reply("Введіть p - більше за 2")
                }
                break;
            case "lineareq":
                await exec(`./scripts/cpp/dm/linearequation ${ss[1]} ${ss[2]} ${ss[3]} ./temp/${id}/solving.tex`);

                await latex.compile(id);
                await ctx.replyWithPhoto({source: `temp/${ctx.message.from.id}/solving1.png`})
                await ctx.replyWithPhoto({source: `temp/${ctx.message.from.id}/solving2.png`})
                break;
            default:
                ctx.reply(s)
                break;
        }
    } else {
        switch(ss[0].toLowerCase()) {
            case "/help":
                break
            case "rootmod":
                var a = parseInt(ss[1])
                var p = parseInt(ss[2])
                if ((a > 0) && (p > 2)) {
                    ctx.reply("rootmod")
                } else ctx.reply("Введи нормальні числа")
                break;
            case "gcd":
                var m1 = parseInt(ss[1])
                var n1 = parseInt(ss[2])
                if ((m1 > 0) && (n1 > 0)) {
                    ctx.reply("gcd")
                } else {
                    "Введи нормальні числа"
                }
                break
            case "jacobi":
                var m1 = parseInt(ss[1])
                var n1 = parseInt(ss[2])
                if ((m1 > 0) && (n1 > 1) && (n1 % 2 != 0)) {
                    ctx.reply("jacobi")
                } else ctx.reply("Введи нормальні числа")
            case "lineraeq":
                ctx.reply("lineareq")
                break
            default:
                ctx.reply(s)
                break
        }
    }
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
//http.createServer(bot.webhookCallback('/')).listen(8100, '127.0.0.1');