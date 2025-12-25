import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as handlebars from 'handlebars';
import { ValidationPipe } from '@nestjs/common';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

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
  
  app.register(require('@fastify/view'), {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), 
  });

  
  await app.register(require('@fastify/multipart'), {
    
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });
  await app.register(require('@fastify/static'), {
	root: join(__dirname, '..', 'public'), 
	prefix: '/static/', 
  });
  await app.register(require('@fastify/cookie'))
  
  await app.register(require('@fastify/secure-session'), {
    secret: 'aVerySecretaVerySecretKeyaVerySecretKeyaVerySecretKeyaVerySecretKeyKey',
    cookie: {
      secure: false,       
      httpOnly: true,      
      sameSite: 'lax',     
      maxAge: 15 * 60 * 1000 
    },
    saveUninitialized: false,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
