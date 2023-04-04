import { Module, HttpModule } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Module({
  providers: [TwilioService],
  exports: [TwilioService],
  imports: [
    HttpModule.register({
      baseURL: 'https://chat.twilio.com/v2',
      headers: {
        appid: process.env.TWILIO_ACCOUNT_SID,
        apikey: process.env.TWILIO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json'
      }
    })
  ]
})
export class TwilioModule { }
