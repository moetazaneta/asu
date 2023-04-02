import { bot } from "./bot.js";
import { db } from "./db.js";
import { MailClient } from "./mailClient.js";

class UserRepo {
  #mailClients = {}

  constructor() {
    this.#init();
  }

  #init() {
    db.getAll()
      .forEach(({ chatId, credentials }) => this.#createMailClient(chatId, credentials))
  }

  #createMailClient(chatId, credentials) {
    const mailClient = new MailClient(
      credentials.email,
      credentials.password,
    )
    mailClient.onCode((text) => bot.sendCode(chatId, text));

    this.#mailClients[chatId] = mailClient;
  }

  getEmail(chatId) {
    return db.getOne(chatId).credentials.email;
  }

  add(chatId, credentials) {
    this.#createMailClient(chatId, credentials);
    db.create(chatId, credentials);
  }

  delete(chatId) {
    this.#mailClients[chatId].destroy();
    db.delete(chatId);
  }
}

export const userRepo = new UserRepo()