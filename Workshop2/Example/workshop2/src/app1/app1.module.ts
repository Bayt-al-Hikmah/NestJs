import { Module } from '@nestjs/common';
import { App1Controller } from './app1.controller';

@Module({
  controllers: [App1Controller]
})
export class App1Module {}
