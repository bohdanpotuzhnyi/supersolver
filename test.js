const http = require('http');
const os = require("os");
const cluster = require("cluster");
const { exec } = require('child_process');
const { Telegraf } = require('telegraf');
const { Extra } = require('telegraf')
const jacobi = require('./scripts/jacobi.js');
const latex = require('./scripts/latex.js')
const basic = require('./scripts/basic.js')
const fs = require('fs')
//const keyboard = require('./scripts/keyboard.js');

const token = '1681110137:AAEmEwDuJFK-lps4pD4uL6LKPrSE3zRtACI';
const bot = new Telegraf(token);
const clusterWorkerSize = os.cpus().length;

bot.telegram.setWebhook("https://api.queuebot.me");

function getMessage(path) {
    return fs.readFileSync(`messages/${path}`, 'utf8');
}

whitelist = {

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
    ctx.replyWithMarkdown(getMessage('help.txt'));
});

bot.command(['gcd', 'lineareq', 'poleq', 'jacobi', 'rootmod', 'cancel', 'markov', 'feedback', 'donate'], (ctx) => {
    const id = ctx.message.from.id, command = ctx.message.text.split(' ')[0].substring(1);
    let user = JSON.parse(fs.readFileSync(`users/${id}.json`).toString());
    switch (command) {
        case 'cancel':
            user.state = null;
            ctx.reply(getMessage('cancel.txt'));
            break;
        case 'donate':
            ctx.reply(getMessage(`donate.txt`));
            break;
        default:
            user.state = command;
            ctx.reply(getMessage(`commands/${command}.txt`));
    }
    fs.writeFileSync(`users/${id}.json`, JSON.stringify(user));
});

bot.on('text', async (ctx) => {
    const id = ctx.message.from.id;
    const user = JSON.parse(fs.readFileSync(`users/${id}.json`).toString());
    switch (user.state) {
        case 'gcd':
            await gcd_command(ctx);
            break;
        case 'lineareq':
            await lineareq_command(ctx);
            break;
        case 'poleq':
            await poleq_command(ctx);
            break;
        case 'jacobi':
            await jacobi_command(ctx);
            break;
        case 'rootmod':
            await rootmod_command(ctx);
            break;
        case 'markov':
            await markov_command(ctx);
            break;
        case 'feedback':
            await feedback_command(ctx);
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

function secureParsing(number) {
    let result = Number(number);
    if (Math.abs(result) <= Number.MAX_SAFE_INTEGER) {
        return result
    }
    else {
        throw "Number is too large or too small";
    }
}

async function gcd_command(ctx) {
    const id = ctx.message.from.id;
    if (!fs.existsSync(`temp/${id}`))
        await fs.promises.mkdir(`temp/${id}`);
    try {
        const split = ctx.message.text.split(' ');
        split.forEach(secureParsing);
        const m1 = split[0];
        const n1 = split[1];
        if((m1 > 1) && (n1 > 1)) {
            let s = basic.display_ea(m1, n1);
            await latex.writetex(id, s);
            await latex.compile(id);

            const images = [];
            for (let i = 1; fs.existsSync(`temp/${id}/solving${i}.png`); ++i) {
                images.push({
                    media: { source: `temp/${id}/solving${i}.png` },
                    type: 'photo'
                });
            }
            await ctx.replyWithMediaGroup(images);
        }else ctx.reply("Введи нормальні числа");
    } catch (error) {
        ctx.reply(error.toString());
        console.error(error);
    } finally {
        await fs.promises.rm(`temp/${id}`, {recursive: true});
    }
}

async function lineareq_command(ctx) {
    const id = ctx.message.from.id;
    if (!fs.existsSync(`temp/${id}`))
        await fs.promises.mkdir(`temp/${id}`);
    try {
        const split = ctx.message.text.split(' ');
        if (split[2] > 0) {
            split.forEach(secureParsing);
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
        }
        else {
            ctx.reply('n должно быть > 0');
        }
    } catch (error) {
        ctx.reply(error.toString());
        console.error(error);
    } finally {
        await fs.promises.rm(`temp/${id}`, {recursive: true});
    }
}

async function markov_command(ctx){
    const id = ctx.message.from.id;
    if (!fs.existsSync(`temp/${id}`))
        await fs.promises.mkdir(`temp/${id}`);
    try {
        markov_req = markov_parse(ctx.message.text);

        if(markov_req  == "parse error"){
            ctx.reply("Не правильний ввід")
        } else {
            //const split = ctx.message.text.split(' ');

            await execute(`./scripts/cpp/mathlog/markov ${markov_req} temp/${id}/solution.tex`);
            await execute(`latex solution.tex`, {cwd: `temp/${id}`});
            await execute(`dvipng solution.dvi -D 600`, {cwd: `temp/${id}`});

            const images = [];
            for (let i = 1; fs.existsSync(`temp/${id}/solution${i}.png`); ++i) {
                images.push({
                    media: {source: `temp/${id}/solution${i}.png`},
                    type: 'photo'
                });
            }
            await ctx.replyWithMediaGroup(images);
        }
    } catch (error) {
        ctx.reply(error.toString());
        console.error(error);
    } finally {
        await fs.promises.rm(`temp/${id}`, {recursive: true});
    }
}

function markov_parse(s){
    var act = false;
    var rule_arr = [];
    var k = 0;
    var str = "";
    var letters = /^[0-9a-zA-Z]+$/;
    for(i = 0; i < s.length; i++){
        str = s[i];
        if(letters.test(str)){
            if(!act){
                act = true;
                rule_arr[k] = s[i];
            }else{
                rule_arr[k] += s[i];
            }
        }else{
            if(act){
                act = false;
                k += 1;
            }
        }
    }
    s = ""
    if(rule_arr.length % 2 == 1){
        for(i = 0; i < rule_arr.length; i++){
            s += `${rule_arr[i]} `
        }
    }else{
        s = "parse error"
    }
    return s;
}

function poleq_command(ctx) {
    ctx.reply('poleq is in development');
}

async function jacobi_command(ctx) {
    const id = ctx.message.from.id;
    if (!fs.existsSync(`temp/${id}`))
        await fs.promises.mkdir(`temp/${id}`);
    try {
        const split = ctx.message.text.split(' ');
        split.forEach(secureParsing);
        const m1 = split[0];
        const n1 = split[1];
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

async function rootmod_command(ctx) {
    const id = ctx.message.from.id;
    if (!fs.existsSync(`temp/${id}`))
        await fs.promises.mkdir(`temp/${id}`);
    try {
        const split = ctx.message.text.split(' ');
        split.forEach(secureParsing);
        const a = split[0];
        const p = split[1];
        if((a > 0) && (p > 2)){
            if(basic.prime(p)){
                const jacs = jacobi.jac_custom(a, p)
                await exec(`/home/queuebot/api.queuebot.me/scripts/cpp/dm/rootmod ${jacs.res} ${a} ${p} /home/queuebot/api.queuebot.me/temp/${id}/solving1.tex`);
                const data = fs.readFileSync(`/home/queuebot/api.queuebot.me/temp/${id}/solving1.tex`, 'utf8');
                jacs.s += data;
                await latex.wts(ctx.message.from.id, jacs.s)
                await latex.compile(id);

                const images = [];
                for (let i = 1; fs.existsSync(`temp/${id}/solving${i}.png`); ++i) {
                    images.push({
                        media: { source: `temp/${id}/solving${i}.png` },
                        type: 'photo'
                    });
                }
                await ctx.replyWithMediaGroup(images);
            } else ctx.reply(`${p}-не просте`)
        }else{
            ctx.reply("Введіть p - більше за 2")
        }
    } catch (error) {
        ctx.reply(error.toString());
        console.error(error);
    } finally {
        await fs.promises.rm(`temp/${id}`, {recursive: true});
    }
}

const admins = [341421484, 497327654]

function feedback_command(ctx) {
    for (const admin of admins) {
        ctx.forwardMessage(admin);
        bot.telegram.sendMessage(admin, `Новое сообщение от [${ctx.message.from.id}](tg://user?id=${ctx.message.from.id})`, { parse_mode: 'MarkdownV2' });
    }
    ctx.reply("Сообщение отправлено")
}

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