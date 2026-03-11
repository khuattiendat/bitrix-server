import { MailerOptions } from '@nestjs-modules/mailer';
import { rootConfig } from './const.config';

export const mailerConfig: MailerOptions = {
  transport: {
    host: rootConfig.EMAIL_HOST,
    port: rootConfig.EMAIL_PORT,
    secure: rootConfig.EMAIL_SECURE,
    auth: {
      user: rootConfig.EMAIL_USER,
      pass: rootConfig.EMAIL_PASS,
    },
  },
  defaults: {
    from: `"No Reply" <${rootConfig.EMAIL_FROM}>`,
  },
};
