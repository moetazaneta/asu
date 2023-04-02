import { Telegraf } from 'telegraf'
import { userRepo } from './userRepo.js'

class Bot {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    this.bot.start((ctx) => ctx.reply('Welcome!'));
    this.bot.help((ctx) => ctx.reply(
      'To add your account, type `/add {you@gmail.com} {app-password}`',
      { parse_mode: "markdown" }
    ));

    this.bot.command('add', (ctx) => {
      const [email, password] = ctx.message.text.slice(5).split(' ')
      const chatId = ctx.message.chat.id;

      userRepo.add(chatId, {
        email,
        password,
      })

      ctx.reply(`Added ${email}`);
    })

    this.bot.command('delete', ctx => {
      const chatId = ctx.message.chat.id;
      ctx.reply(`Removed ${userRepo.getEmail(chatId)}`);
      userRepo.delete(chatId);
    })

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  start() {
    this.bot.launch()
  }

  sendCode(chatId, code) {
    this.bot.telegram.sendMessage(chatId, `\`${code}\``, {
      parse_mode: "markdown",
    })
  }
}

export const bot = new Bot();