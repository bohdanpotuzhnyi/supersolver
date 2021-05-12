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

bot.on('message',(ctx,next) => {
    const id = ctx.message.from.id;
    if (!fs.existsSync(`users/${id}.json`)) {
        fs.writeFileSync(`users/${id}.json`, JSON.stringify({state:null}));
    }
    return next();
});

bot.start((ctx) => {
    ctx.reply(getMessage('start.txt'));
});

bot.help((ctx) => {
    ctx.reply(getMessage('help.txt'));
});

bot.command(['gcd', 'lineareq', 'jacobi', 'rootmod', 'cancel'], (ctx) => {
    const id = ctx.message.from.id, command = ctx.message.text.split(' ')[0].substring(1);
    let user = JSON.parse(fs.readFileSync(`users/${id}.json`).toString());
    if (command === 'cancel') {
        user.state = null;
        ctx.reply(getMessage('cancel.txt'));
    }
    else {
        user.state = command;
        ctx.reply(getMessage(`problems/${command}.txt`));
    }
    fs.writeFileSync(`users/${id}.json`, JSON.stringify(user));
});

bot.on('text', (ctx) => {
    const id = ctx.message.from.id;
    const user = JSON.parse(fs.readFileSync(`users/${id}.json`).toString());
    switch (user.state) {
        case 'gcd':
            gcd_problem(ctx);
            break;
        case 'lineareq':
            lineareq_problem(ctx);
            break;
        case 'jacobi':
            jacobi_problem(ctx);
            break;
        case 'rootmod':
            rootmod_problem(ctx);
            break;
        default:
            ctx.reply(getMessage('help.txt'));
    }
    user.state = null;
    fs.writeFileSync(`users/${id}.json`, JSON.stringify(user));
});

function execute(cmd, opts={}) {
    return new Promise((resolve, reject) => {
        exec(cmd, opts, (error, stdout) => {
            if (error) {
                reject(error.message);
            }
            resolve(stdout);
        });
    });
}

function gcd_problem(ctx) {
    ctx.reply('gcd is in development');
}

async function lineareq_problem(ctx) {
    const id = ctx.message.from.id;
    if (!fs.existsSync(`temp/${id}`))
        await fs.promises.mkdir(`temp/${id}`);
    try {
        const split = ctx.message.text.split(' ');
        await execute(`./scripts/cpp/dm/linearequation ${split[0]} ${split[1]} ${split[2]} temp/${id}/solution.tex`);
        await execute(`latex solution.tex`, {cwd: `temp/${id}`});
        await execute(`dvipng solution.dvi -D 600`, {cwd: `temp/${id}`});

        const images = [];
        for (let i = 1; fs.existsSync(`temp/${id}/solution${i}.png`); ++i) {
            images.push({
                media: { source: `temp/${id}/solution${i}.png` },
                type: 'photo'
            });
        }
        await ctx.replyWithMediaGroup(images);
    } catch (error) {
        ctx.reply(error.toString());
        console.error(error);
    } finally {
        await fs.promises.rm(`temp/${id}`, {recursive: true});
    }
}

async function jacobi_problem(ctx) {
    const id = ctx.message.from.id;
    if (!fs.existsSync(`temp/${id}`))
        await fs.promises.mkdir(`temp/${id}`);
    try {
        const split = ctx.message.text.split(' ');
        const m1 = parseInt(split[0]);
        const n1 = parseInt(split[1]);
        if((m1 > 1) && (n1 > 2) && (n1 % 2 !== 0)) {
            const s = jacobi.jac_custom(m1, n1);
            await latex.writetex(id, s.s)
            await latex.compile(id);

            const images = [];
            for (let i = 1; fs.existsSync(`temp/${id}/solving${i}.png`); ++i) {
                images.push({
                    media: { source: `temp/${id}/solving${i}.png` },
                    type: 'photo'
                });
            }
            await ctx.replyWithMediaGroup(images);
        }else ctx.reply("Введи нормальні числа")
    } catch (error) {
        ctx.reply(error.toString());
        console.error(error);
    } finally {
        await fs.promises.rm(`temp/${id}`, {recursive: true});
    }
}

function rootmod_problem(ctx) {
    ctx.reply('rootmod is in development');
}

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