import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueName } from '../queues/queue.const';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.MAIL_QUEUE,
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService, BullModule],
})
export class MailModule {}
