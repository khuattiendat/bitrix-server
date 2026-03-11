import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
interface SendMailData {
  email: string;
  subject: string;
  html: string;
}
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  async sendMail(data: SendMailData) {
    await this.mailerService.sendMail({
      to: data.email,
      subject: data.subject,
      html: data.html,
    });
  }
}
