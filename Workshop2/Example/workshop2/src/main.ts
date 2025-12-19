import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';
import fastifyView from '@fastify/view';
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

  await app.register(fastifyView, {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'),
    layout: 'layout',
    options: {
      partials: {
      navbar: 'partials/navbar.hbs',
	    footer: 'partials/footer.hbs'
      },
    },
  });
  await app.register(require('@fastify/static'), {
  root: join(__dirname, '..', 'public'), 
  prefix: '/static/', 
  });
  
  await app.register(require('@fastify/cookie'));
  await app.register(require('@fastify/csrf-protection'));

  await app.listen(3000);
}
bootstrap();