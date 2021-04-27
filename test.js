const http = require('http');
const { Telegraf } = require('telegraf');

const token = '1691713249:AAG6g1uwDsNs6aaI6uX6GQEOnWX5zaXjKwc';

const bot = new Telegraf(token)

bot.on('text', (ctx) => {
    ctx.reply("fck u");
})

http.createServer(bot.webhookCallback('/')).listen(8100, '127.0.0.1');