class DB {
  #db = [];

  constructor() {}

  getAll() {
    return this.#db;
  }

  getOne(chatId) {
    return this.#db.find(item => item.chatId === chatId);
  }

  create(chatId, credentials) {
    this.#db.push({ chatId, credentials });
  }

  delete(chatId) {
    this.#db = this.#db.filter(item => item.chatId !== chatId);
  }
}

export const db = new DB()