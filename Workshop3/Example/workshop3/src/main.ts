import { NestFactory } from '@nestjs/core';
import {FastifyAdapter,NestFastifyApplication, } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';
import * as handlebars from 'handlebars';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
  await app.register(require('@fastify/static'), {
    root: join(__dirname, '..', 'public'), 
    prefix: '/static/', 
  });
  app.register(require('@fastify/view'), {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), // Path to templates
  });
  require('dotenv').config();
  await app.register(require('@fastify/secure-session'), {
    secret:  process.env.SECRET,
    cookie: {
      secure: false,       
      httpOnly: true,      
      sameSite: 'lax',     
      maxAge: 15 * 60 * 1000 
    },
    saveUninitialized: false,
  });
  await app.listen(3000);

}
bootstrap();