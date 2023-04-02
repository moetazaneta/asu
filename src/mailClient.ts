import Imap from "imap";
import { simpleParser } from 'mailparser';

export class MailClient {
  private handleCode: (code: string) => void = () => {}
  private imap: Imap;

  constructor(
    user: string,
    password: string,
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
      this.searchMail();
    });
    this.imap.once('error', (error: unknown) => {
      console.log('Error:', error)
    });
    this.imap.once('end', () => {
      console.log('End');
    });

    this.imap.connect();
  }

searchMail() {
    this.imap.openBox('INBOX', true, () => {
      this.imap.on('mail', () => {
        const searchCriteria = [
          'UNSEEN',
          ['SINCE', new Date()],
          ['FROM', process.env.EMAIL]
        ]
        this.imap.search(searchCriteria, (_error, ids) => {
          const mailId = ids.at(-1);
          if (mailId != null) {
            this.fetchMail(mailId);
          }
        })
      });
    });
  }

  private fetchMail(result: number) {
    const f = this.imap.fetch(result, {
      bodies: ['TEXT'],
      markSeen: false
    });

    f.on('message', msg => {
      console.log('message')
      msg.on('body', stream => {
        simpleParser(stream, async (err, mail) => {
          const salt = mail.headerLines.find(headerLine => headerLine.key === '')?.line;
          const text = salt ? mail.text?.split(salt)[0] : mail.text;

          // "Перевод клиенту. Код подтверждения: 12345"
          const code = text?.split('Код подтверждения: ')[1].split('\n')[0]
          if (code) {
            this.handleCode(code);
          }
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

  onCode(handleCode: (code: string) => void) {
    this.handleCode = handleCode
  }

  destroy() {
    this.imap.end();
  }
}
