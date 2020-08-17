import { google, GoogleApis, gmail_v1 } from 'googleapis';
const OAuth2 = google.auth.OAuth2;

export class EmailMessage {
  public value: string;

  constructor(
    public title: string = 'Tytuł wiadomości',
    public from: string = 'adrian.furman.dev@gmail.com',
    public to: string[] = ['fadikk367@gmail.com'],
    public body: string = 'To jest testowy tytuł wiadomości'
  ) {
    const recivers = to.reduce((result: string, reciver: string) => {
      return result.concat(`<${reciver}>, `);
    }, 'To: ');

    const messageParts = [
      `From: <${this.from}>`,
      `To: ${recivers}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${title}`,
      '',
      `${body}`,
      'This is a message just to say hello.',
      'So... <b>Hello!</b>  🤘❤️😎',
    ];

    this.value = messageParts.join('\n');
  }
}

export class GmailMailer {
  private static instance: GmailMailer;
  private static google: GoogleApis = google;
  private static gmail: gmail_v1.Gmail = google.gmail('v1');
  static emailAddress = 'adrian.furman.dev@gmail.com';

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new GmailMailer();
    return this.instance;
  }

  static authentificate() {
    const clientId = process.env.GOOGLE_CLIENT_ID as string;
    const secretToken = process.env.GOOGLE_SECRET_TOKEN as string;
    const redirectAddress = process.env.GOOGLE_REDIRECT_ADDRESS as string;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN as string;

    const oauth2Client = new OAuth2(
      clientId,
      secretToken,
      redirectAddress
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    google.options({ auth: oauth2Client });
  }

  static encodeMessage(message: EmailMessage): string {
    const encodedMessage = Buffer.from(message.value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return encodedMessage;
  }

  static async send(message: EmailMessage) {
    const encodedMessage = this.encodeMessage(message);

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return response;
  }
}