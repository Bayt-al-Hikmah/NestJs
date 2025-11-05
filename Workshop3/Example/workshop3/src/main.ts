import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';
import fastifyView from '@fastify/view';
import * as handlebars from 'handlebars';
import fastifyCookie from '@fastify/cookie';
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
  app.register(fastifyView, {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), // Path to templates
  });
  await app.register(fastifyCookie, {
  secret: 'YOUR_VERY_SECRET_KEY_HERE'
});
  await app.listen(3000);
}
bootstrap();