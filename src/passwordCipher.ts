import {AES, enc} from 'crypto-js';


export class PasswordCipher {
  public static encrypt(password: string) {
    if (process.env.PASSWORD_SECRET === undefined) {
      throw new Error('PASSWORD_SECRET is not defined');
    }
    return AES.encrypt(password, process.env.PASSWORD_SECRET).toString();
  }
  
  public static decrypt(encodedPassword: string) {
    if (process.env.PASSWORD_SECRET === undefined) {
      throw new Error('PASSWORD_SECRET is not defined');
    }
    return AES.decrypt(encodedPassword, process.env.PASSWORD_SECRET).toString(enc.Utf8);
  }
}