import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { join } from 'path';
import * as handlebars from 'handlebars';
import { ValidationPipe } from '@nestjs/common';
import { NotFoundExceptionFilter } from './common/filters/noFound-exception.filter'; // we import it
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  ); 
  

  // we add it inside the boostrap function
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.register(require('@fastify/static'), {
	root: join(__dirname, '..', 'uploads'), 
	prefix: '/media/', 
  });

  await app.register(require('@fastify/static'), {
    root: join(__dirname, '..', 'public'), 
    prefix: '/static/', 
    decorateReply: false, 
  });


  await app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024, 
    },
  });

  app.register(require('@fastify/view'), {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), 
  });

   

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
