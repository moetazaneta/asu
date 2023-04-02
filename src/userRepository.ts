import { PrismaClient } from '@prisma/client'
import { PasswordCipher } from './passwordCipher';

class UserRepository {
  private client: PrismaClient;

  public constructor() {
    this.client = new PrismaClient();
  }

  public async getAll() {
    const users = await this.client.users.findMany();
    return users.map(user => ({ ...user, password: PasswordCipher.decrypt(user.password) }));
  }

  public async getOne(chatId: number) {
    const user = await this.client.users.findUnique({
      where: {
        chatId,
      },
    });

    if (user === null) {
      return null
    }

    return {
      ...user,
      password: PasswordCipher.decrypt(user.password),
    }
  }

  public async create(chatId: number, credentials: Credentials) {
    await this.client.users.create({
      data: {
        chatId,
        email: credentials.email,
        password: PasswordCipher.encrypt(credentials.password),
      },
    });
  }

  public async delete(chatId: number) {
    await this.client.users.delete({
      where: {
        chatId,
      },
    });
  }
}

export const userRepository = new UserRepository()