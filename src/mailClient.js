import Imap from "imap";
import { simpleParser } from 'mailparser';

export class MailClient {
  #handleCode = () => {}

  constructor(
    user,
    password,
  ) {
    const config = {
      user,
      password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false
      },
    }

    this.imap = new Imap(config);

    this.imap.once("ready", () => {
      this.#searchMail();
    });
    this.imap.once('error', error => {
      console.log('Error:', error)
    });
    this.imap.once('end', () => {
      console.log('End');
    });

    this.imap.connect();
  }

  #searchMail() {
    this.imap.openBox('INBOX', true, () => {
      this.imap.on('mail', () => {
        const searchCriteria = [
          'UNSEEN',
          ['SINCE', new Date()],
          ['FROM', process.env.EMAIL]
        ]
        this.imap.search(searchCriteria, (_error, results) => {
          this.#fetchMail(results.at(-1));
        })
      });
    });
  }

  #fetchMail(results) {
    const f = this.imap.fetch(results, {
      bodies: ['TEXT'],
      markSeen: false
    });

    f.on('message', msg => {
      console.log('message')
      msg.on('body', stream => {
        simpleParser(stream, async (err, parsed) => {
          const salt = parsed.headerLines.find(headerLine => headerLine.key === '').line;
          const text = parsed.text.split(salt)[0];
          // "Перевод клиенту. Код подтверждения: 12345"
          const code = text.split('Код подтверждения: ')[1].split('\n')[0]
          this.#handleCode(code);
        });
      });
    });
    f.once('error', error => {
      console.log('Error when fetching message', error);
    });
    f.once('end', () => {
      console.log('Done fetching message');
    });
  }

  onCode(handleCode) {
    this.#handleCode = handleCode
  }

  destroy() {
    this.imap.end();
  }
}
