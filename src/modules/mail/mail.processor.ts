import { Process, Processor } from '@nestjs/bull';
import { QueueName } from '../queues/queue.const';
import { Job } from 'bull';
import { MailService } from './mail.service';
import { rootConfig } from '@/configs/const.config';
interface ForgotPasswordJobData {
  email: string;
  token: string;
}
@Processor(QueueName.MAIL_QUEUE)
export class MailProcessor {
  constructor(private mailService: MailService) {}
  @Process(QueueName.FORGOT_PASSWORD_JOB)
  async handleSendMailForgotPassword(job: Job<ForgotPasswordJobData>) {
    const { email, token } = job.data;
    const resetLink = `${rootConfig.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;
    console.log('Sending password reset email to:', email);

    await this.mailService.sendMail({
      email,
      subject: 'Password Reset Request',
      html,
    });
    console.log('Password reset email sent to:', email);
  }
}
