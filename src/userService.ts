import { bot } from "./bot";
import { userRepository } from "./userRepository";
import { MailClient } from "./mailClient";

class UserService {
  private mailClients: Record<number, MailClient> = {}
  
  public constructor() {
    this.init();
  }

  private async init() {
    const users = await userRepository.getAll();
    users.forEach(({ chatId, email, password }) => this.createMailClient(chatId, {email, password}))
  }

  private createMailClient(chatId: number, credentials: Credentials) {
    const mailClient = new MailClient(
      credentials.email,
      credentials.password,
    )
    mailClient.onCode((text) => bot.sendCode(chatId, text));

    this.mailClients[chatId] = mailClient;
  }

  public async getEmail(chatId: number) {
    const user = await userRepository.getOne(chatId);
    if (user === null) {
      return null;
    }
    return user.email;
  }

  public add(chatId: number, credentials: Credentials) {
    this.createMailClient(chatId, credentials);
    userRepository.create(chatId, credentials);
  }

  public delete(chatId: number) {
    this.mailClients[chatId].destroy();
    userRepository.delete(chatId);
  }
}

export const userService = new UserService()