import { Controller, Get,Render } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipThrottle} from '@nestjs/throttler';

//@SkipThrottle(){defualt:{ limit: 3, ttl: 60 }}
@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  //@Throttle({defualt:{ limit: 3, ttl: 60 }})
  @Get()
  @Render('index')
  index(){
  }
}
