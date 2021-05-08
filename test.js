const http = require('http');

const { Telegraf } = require('telegraf');
const jacobi = require('./scripts/jacobi.js');

const token = '1681110137:AAEmEwDuJFK-lps4pD4uL6LKPrSE3zRtACI';
const bot = new Telegraf(token);


bot.telegram.setWebhook("https://api.queuebot.me");

bot.on('text', (ctx) => {
    var s = ctx.message.text
    var ss = s.split(' ')
    if (ss[0] === "Jacobi" || ss[0] === "jacobi") {
            var m1 = parseInt(ss[1])
            var n1 = parseInt(ss[2])

            s = jacobi.jac_custom(m1, n1)
    }
    ctx.reply(s)
})
http.createServer(bot.webhookCallback('/')).listen(8100, '127.0.0.1');