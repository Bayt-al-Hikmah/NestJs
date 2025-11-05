import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import fastifyView from '@fastify/view';
import * as handlebars from 'handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(fastifyStatic, {
	root: join(__dirname, '..', 'uploads'), 
	prefix: '/media/', 
  });
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, 
    },
  });

  app.register(fastifyView, {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), 
  });

   await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'public'), 
    prefix: '/public/', 
    decorateReply: false, 
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
