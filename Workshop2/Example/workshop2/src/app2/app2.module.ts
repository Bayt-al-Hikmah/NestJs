import { Module } from '@nestjs/common';
import { App2Controller } from './app2.controller';

@Module({
  controllers: [App2Controller]
})
export class App2Module {}
