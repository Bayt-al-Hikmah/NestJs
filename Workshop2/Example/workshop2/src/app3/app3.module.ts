import { Module } from '@nestjs/common';
import { App3Controller } from './app3.controller';
@Module({
    controllers: [App3Controller]
})
export class App3Module {}
