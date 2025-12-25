import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TaskModule } from './task/task.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule,ThrottlerGuard  } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import {ThrottlerStorageRedisService} from '@nest-lab/throttler-storage-redis'
import {redis } from './redis/redis.client'
@Module({
  imports: [
     ThrottlerModule.forRoot({
      throttlers:[{
      ttl: 60000,
      limit: 10,
    }],
    storage: new ThrottlerStorageRedisService(redis)
    }),
      TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,

    }),UsersModule, TaskModule, AuthModule],
  controllers: [AppController],
  providers: [AppService,{
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }],
})
export class AppModule {}
