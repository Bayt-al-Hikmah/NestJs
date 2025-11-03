import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';
import fastifyView from '@fastify/view';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';

import * as handlebars from 'handlebars';


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.register(fastifyView, {
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
    await app.register(fastifyCookie);

  await app.register(fastifyCsrf);



  await app.listen(3000);
}
bootstrap();