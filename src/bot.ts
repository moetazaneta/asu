import { Telegraf } from 'telegraf'
import { userService } from './userService'

class Bot {
  private readonly bot: Telegraf;

  public constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

    this.bot.start((ctx) => ctx.reply('Welcome!'));
    this.bot.help((ctx) => ctx.reply(
      'To add your account, type `/add {you@gmail.com} {app-password}`',
      { parse_mode: "Markdown" }
    ));

    this.bot.command('add', (ctx) => {
      const [email, password] = ctx.message.text.slice(5).split(' ')
      const chatId = ctx.message.chat.id;

      userService.add(chatId, {
        email,
        password,
      })

      ctx.reply(`Added ${email}`);
    })

    this.bot.command('delete', async ctx => {
      const chatId = ctx.message.chat.id;
      ctx.reply(`Removed ${await userService.getEmail(chatId)}`);
      await userService.delete(chatId);
    })

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  public start() {
    this.bot.launch()
  }

  public sendCode(chatId: number, code: string) {
    this.bot.telegram.sendMessage(chatId, `\`${code}\``, {
      parse_mode: "Markdown",
    })
  }
}

export const bot = new Bot();