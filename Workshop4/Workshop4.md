## Objectives
- Upload and manage files efficiently
- Work with Project Configuration
- Exploring Pipes, Guards, and Interceptors
## Upload and Manage Files Efficiently in NestJS
NestJS offers a powerful and flexible way to handle file uploads. This involves using  `@fastify/multipart` to handle `multipart/form-data`, which is primarily used for file uploads.
### Introduction
Handling file uploads introduces challenges like storage management, security (e.g., file type validation, size limits), and performance optimization. NestJS leverages platform-specific libraries:   
For Fastify Platform we uses `@nestjs/platform-fastify` and the `@fastify/multipart` plugin, which is optimized for performance and lower overhead.
### Creating App
Lets create simple app that allow us to upload images and display them. we start by creating new project using the NestJs Cli
```shell
nest new workshop4
```
### Configuration for File Uploads 
Since the default `@nestjs/platform-express` interceptors (like `FileInterceptor`) are incompatible with Fastify, we must use a Fastify-native approach, typically involving the `@fastify/multipart` plugin or a compatible wrapper.
#### Enable Fastify Adapter
Fastify uses the `@fastify/multipart` package. We need to install it and register it via the Fastify Adapter.
```shell
npm install @nestjs/platform-fastify @fastify/multipart
```
Then, configure the application in `main.ts` to use the Fastify Adapter and register the `multipart` plugin:

**`src/main.ts`**
```ts
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Register the fastify-multipart plugin
  await app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024, 
    },
  });

  await app.listen(3000);
}
bootstrap();
```
We first set our NestJs app to use `NestFastifyApplication` after that we registered the multipart plugin using `await app.register(require('@fastify/multipart')`,  we added some configuration for the upload functionality, user can't upload filer larger then 10 MB.
#### File Storage and Serving
After we setting the upload plugin we need to set additional plugin for serving the files, we install the `@fastify/static` plugin
```shell
npm install @fastify/static
```
After that we regster this plugin inside our ``main.ts`` file.

**`src/main.ts`**
```ts
import { join } from 'path';

  // Register this inside the boostrap function
  await app.register(require('@fastify/static'), {
	root: join(__dirname, '..', 'uploads'), 
	prefix: '/media/', 
  });

```
We set the application to serve our media from `uploads/` folder which live in same level as the `src` folder, the application will server them under the ``/media`` route, If the folder don't exist we need to create it or our app will crash.
### Setting the Templates
After configuring the file upload we need to, create templates for uplading and displaying the images we want to upload, we start by installing the view plugin and the handelbars engine
```
npm install @fastify/view handlebars
```
Then we aregister the plugin inside our ``main.ts`` file
```ts
// other imports
import * as handlebars from 'handlebars'; //we add this import

// we regisrer the plugin inside boostrap function
 app.register(require('@fastify/view'), {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), // Path to templates

  }); 
```
### Setting static files
We also need to serve styles and other static files for our app, so we configure the ``main.ts`` to serve, static files from the ``public`` folder.to do that we register the ``'@fastify/static'`` plugin with new route.
```ts
 //we add this inside the boostrap function
 await app.register(require('@fastify/static'), {
    root: join(__dirname, '..', 'public'),
    prefix: '/static/', 
    decorateReply: false, // Important for registering multiple static routes
  });
```
### Image Sharing Resource
After we finishing the configuration, its time to create our image sharing resource, it will handel uploading and displaying images.
```shell
nest generate resource image-share
```
#### Creating The Entity and DTO
We start by installing the packages that will handel data validation and the databse connection
```
npm install @nestjs/typeorm typeorm sqlite3 class-validator class-transformer
```
After that we add the database connection configuration to our `app.module.ts` imports
```ts
import {TypeOrmModule} from '@nestjs/typeorm'; // we add this import
//...

// We add this to the imports
TypeOrmModule.forRoot({ 
      type: 'sqlite',
      database: 'db.sqlite', 
      entities: [__dirname + '/**/*.entity{.ts,.js}'], 
      synchronize: true, 
    }),
```
We create now our entity we need to save image id, name and path.  
**``image-share/entities/image-share.entity.ts``**
```ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ImageShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true})
  name: string;

  @Column({ unique: true})
  path: string;

}
```
We register then the entity in our ``image-share.module``
```ts
// we import this
import {ImageShare} from './entities/image-share.entity' 
import { TypeOrmModule } from '@nestjs/typeorm';

//...
// we add the following to the @Module decorator
imports:[TypeOrmModule.forFeature([ImageShare])],
```
Finally we create the data validator.   
**`image-share/dto/create-image-share.dto.ts`**
```ts
import { IsString, IsNotEmpty} from 'class-validator';

export class CreateImageShareDto  {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  path: string;
}
```
And we register validatio inside our ``main.ts`` configuration 
```ts
import { ValidationPipe } from '@nestjs/common'; // we add this import
  
  // we add this inside the boostrap function
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
```
#### Creating Service
Now lets Create the Service that will handel our, app logic, we will create four methods

- `findAll` It return all the images from our database
- `createImage` This method recive createImageDto and use it to create new record in our database, if it fail it throw error
- `saveImage` In this method we saving the file in our server, we first check it type, if it not 'image/jpeg', 'image/png' server will throw error, else it generate uid and use it as file name (this will insure images wont have same name), after that we saving our image in the upload file, then calling `createImage` to save the image in our database
- `handelForm` Finally this method extract file from our Form and send it to `saveImage`, if there is no file in our Form or if it fail to save the file it throw error.  


**`src/image-share/image-share.service.ts`**
```ts
import { Injectable ,BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { MultipartFile, Multipart } from '@fastify/multipart';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageShare } from './entities/image-share.entity'
import { CreateImageShareDto } from './dto/create-image-share.dto'

@Injectable()
export class ImageShareService {
   constructor(
    @InjectRepository(ImageShare)
    private imagesRepository: Repository<ImageShare>
  ) {
  }
  
  async findAll(): Promise<ImageShare[]> {
    return  this.imagesRepository.find();
  }

  async createImage(createImageDto: CreateImageShareDto){
    const newImage = this.imagesRepository.create(createImageDto);
    if (!newImage){
      throw new InternalServerErrorException('Couldn\'t save the Image');
    }
    this.imagesRepository.save(newImage)
  }

  async saveImage(file:MultipartFile){
    const  allowedTypes:string[] = ['image/jpeg', 'image/png'];
    if(!allowedTypes.includes(file.mimetype)){
      throw new BadRequestException('Not Allowed format.');
    }
    const fileExtension = file.filename.split('.').pop();
    const uniqueId = randomUUID();
    const name = `${uniqueId}.${fileExtension}`;
    const filePath = join(process.cwd(), 'uploads', name );
    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream( filePath  );
      file.file.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
    const path = 'media/' + name 
    this.createImage({name,path} as CreateImageShareDto)
  }

  async handelForm(Form:AsyncIterableIterator<Multipart>){
    try {
      let uploadedCount = 0;
      for await (const part of Form) {
        if (part.type === 'file') {
          await this.saveImage(part);
          uploadedCount++;
          break;
        }
      }
      if (uploadedCount === 0) {
        throw new BadRequestException('No file part found in the request.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      throw new InternalServerErrorException('File upload failed due to a server error.');
    }
  }
}
```
#### Creating The Controller
Finally we create Controller to handel our request, it handel two routes.  
- `@Get()` Here we rendering the upload templates with all images that are saved in our database
- `@Post('upload')` Here reciving post request,  we check if it `Multipart`, then we use the `imageShareService` to store the images submitted by user, if request isn't `Multipart` we throw error.


**`src/image-share/image-share.controller.ts`**
```ts
import {Render,Redirect, Controller, Post, Get, Req,BadRequestException} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ImageShareService} from './image-share.service';
import { ImageShare } from './entities/image-share.entity'

@Controller('images')
export class ImageShareController {
  constructor(private readonly imageShareService: ImageShareService) {}

  @Get()
  @Render('upload')
  async getUploadForm() {
    const images: ImageShare[] = await this.imageShareService.findAll();
    return { images };
  }

  @Post('upload')
  @Redirect('/images')
  async uploadImage(@Req() req: FastifyRequest) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data.');
    }
    const parts = req.parts();
    return this.imageShareService.handelForm(parts)
  }
}
```
### Creating the Templates
Now finally we create the template, to display uploading images form and show all uploaded images, we will use the `upload.hbs` template from `material` folder, we save it under ``views`` folder inside our project, same for style we use ``style.css`` file from `material` folder, and we save it under ``public`` folder inside our project.

With this set we can run our project using 
```
npm run start:dev
```
visiting the `/images` route will display, small form to upload images, if we upload image, we will see it added bellow the form 

## Project Configuration in NestJS
### Database Configuration with TypeORM/Prisma 
NestJS heavily favors using robust ORMs like TypeORM or Prisma (which acts as a connection layer) for database interaction. The configuration for database connectivity is typically managed using the **`@nestjs/config`** module and placed within the **`AppModule`** or a dedicated Database module.
#### Using the `@nestjs/typeorm` Module
To connect to a database like PostgreSQL or MySQL, we use the official TypeORM module in NestJS.

First we need to install the core NestJS TypeORM module, the TypeORM package, and the specific driver (e.g., `pg` for PostgreSQL or `mysql2` for MySQL).
```
# For PostgreSQL
npm install @nestjs/typeorm typeorm pg
# For MySQL
npm install @nestjs/typeorm typeorm mysql2
```
After that we configure  `AppModule`, we import and configure the ``TypeOrmModule.forRoot()`` inside our main application module, often using environment variables from a .env file via the ConfigModule.

**Example: PostgreSQL Configuration**
```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env file
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Should be 'false' in production
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

|**NestJS Setting (TypeORM)**|**Equivalent to Django Setting**|**Description**|
|---|---|---|
|`type`|`ENGINE`|Specifies the database driver (`'postgres'`, `'mysql'`, `'sqlite'`).|
|`host`|`HOST`|The address of the database server.|
|`port`|`PORT`|The network port the server is listening on (e.g., `5432`).|
|`database`|`NAME`|The name of the specific database to connect to.|
|`username`, `password`|`USER`, `PASSWORD`|Credentials for connecting to the server.|


The NestJS approach centralizes database configuration in the application module, making the settings easy to manage using environment variables, which is standard for modern application development.
### Module-Based Routing and Namespacing
NestJS applications are built around modules, and routing (or URL organization) is inherently structured by the controller's path prefix and the module's scope. 
#### Controller Path Prefix 
In NestJS, a controller automatically establishes a base route for all its handlers.   

**Example: `ImageShareModule`**

 In our `ImageShareController`, we define the prefix `'images'` as base path.
```ts
// src/image-share/image-share.controller.ts
import { Controller } from '@nestjs/common';

@Controller('images') // <--- This sets the base prefix
export class ImageShareController {
	// ...
	@Get() // Maps to: /images
	async getUploadForm() { /* ... */ }

	@Post('upload') // Maps to: /images/upload
	async uploadImage() { /* ... */ }
}
```
Now when we import the ``ImageShareModule`` into the ``AppModule``, all routes defined in its controllers become accessible under their defined prefixes.
#### Referencing Dynamic URLs
NestJS uses path parameters for dynamic URLs, similar to Django's `<int:photo_id>`. The data is accessed via the **`@Param()`** decorator.

**Example: Dynamic Photo Detail Route**

First we Define the dynamic route in the Controller:
```ts
// src/image-share/image-share.controller.ts
@Get('photo/:photoId') // <--- Defines a dynamic parameter 'photoId'
async getPhotoDetail(@Param('photoId') photoId: string) {
	// 'photoId' holds the value passed in the URL (e.g., the '5' in /images/photo/5)
	return `Showing photo details for ID: ${photoId}`;
}
```
Now we refer to this path by  construct the full URL path when redirecting or generating links in templates.
```html
{{#each images}}
  <a href="/images/photo/{{this.id}}">View Photo</a> 
{{/each}}
```
In Controllers (Redirecting),  we use the `Redirect()` decorator  constructing the path string.
	
```ts
// When redirecting after a successful upload
@Redirect('/images/photo/123')
// OR using the raw response object
// res.redirect(`/images/photo/${newPhotoId}`);
```
### Environment Variables and Configuration Management
A critical component of modern NestJS projects is the use of environment variables we can manage them by using the **`@nestjs/config`** module.

This module allows us to separate configuration from application code, load variables from a `.env` file, and strongly type our configuration schema.

First we install the  `@nestjs/config` package
```
npm install @nestjs/config
```
Then we integrate that on our `AppModule`, this will allow us to use and accss the envirenment variables all over our modules 
```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
	ConfigModule.forRoot({
	  isGlobal: true, // Makes the ConfigService available everywhere
	  envFilePath: '.env', // Specify the file path
	  // Optional: Add schema validation for runtime checks
	}),
	// ... other imports
  ],
})
export class AppModule {}
```
Now after we set the `AppModule`, we can inject the ConfigService into any service or controller to safely access environment variables:
```ts
// src/image-share/image-share.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageShareService {
  constructor(private configService: ConfigService) {
	// Accessing a variable securely
	const dbHost = this.configService.get<string>('DB_HOST');
	// We can then use this host for any configuration needs
  }
  // ...
}
```
This structure ensures that sensitive data (like database credentials, API keys, etc.) is managed outside the codebase and accessed in a standardized, type-safe manner, which is a significant improvement in project security and maintainability.

## Exploring Pipes, Guards, and Interceptors
In any robust backend application, an incoming HTTP request must pass through several stages before it reaches the business logic and returns a response. NestJS formalizes this process using Pipes, Guards, Interceptors, and Exception Filters. These tools allow us to cleanly separate concerns like validation, authorization, logging, and error handling from the main controller and service logic.

### Request Lifecycle
The NestJS request pipeline follows a predictable path. A request enters our application and proceeds through the components in this specific order:
- **Incoming Request:** The request hits the server.
- **Guards:** Checks authorization (e.g., Is the user logged in? Does the user have the required role?). If a Guard fails, the request is blocked immediately.
- **Interceptors (Pre-Controller):** Logic executed before the controller handler runs (e.g., logging the request).
- **Pipes (Parameter-level):** Validation and transformation of data for specific route parameters (e.g., ensuring an ID is a valid number, validating the DTO body).
- **Controller Handler:** Our main business logic starts executing.
- **Service/Database Logic:** The service executes the core logic.
- **Interceptors (Post-Controller):** Logic executed after the controller/service returns, allowing us to transform the final result or handle the promise (e.g., caching, standardizing the response format).
- **Exception Filters:** If any component (Guard, Pipe, Controller, Service) throws an exception, the Exception Filters catch it and standardize the HTTP error response.
- **Outgoing Response:** The final response is sent back to the client.

### Pipes: Validation and Transformation
Pipes are classes decorated with `@Injectable()` that implement the `PipeTransform` interface. They execute immediately before a controller handler is called, operating directly on the arguments.
#### Data Validation with `ValidationPipe`
The built-in `ValidationPipe` is the most common use case. we use it to validate the data that sent by the users, it ensure incoming data meets the structural and content rules defined in our DTOs.  
```ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
```
To apply validation automatically across the entire application, set the global `ValidationPipe` in `main.ts`:
```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```
Now NestJS will validate the request body automatically whenever we use the DTO:
```ts
async addTask(@Body() createTodoDto: CreateTodoDto, @Res() res: FastifyReply,@Request() req)
```
By specifying `@Body() createTodoDto: CreateTodoDto`, NestJS checks the request data according to the rules defined in `CreateTodoDto`.
#### Building Custom Pipes
We can build custom pipes to handle specific transformations, for example a custom pipe can be used to convert an incoming string ID (from a URL path) directly into a database entity object, simplifying controller code.  
**``src/common/pipes/parse-int.pipe.ts``**
```ts
import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
@Injectable()

export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed: Parameter is not an integer.');
    }
    return val;
    }
  }
```
here we created transformer that implement the `PipeTransform<string, number>` interface it have one method ``transform`` it transform ``string`` value to ``int`` and throw error if value not valide, we use it as following

```ts
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.todoService.findOne(id);
}
```
We use the ``ParseIntPipe`` it transform the id from `string` to `int`
### Guards: Authorization and Access Control
Guards, which implement the `CanActivate` interface, are responsible for authorization. They decide whether a request is allowed to proceed based on conditions like user roles, permissions, or time-of-day. Guards are executed before any interceptors or pipes.
#### Understanding the Execution Context
The `canActivate()` method receives an `ExecutionContext` object. This object gives you access to the underlying request details for the current context (HTTP, WebSockets, or gRPC)
```ts
import { ExecutionContext, CanActivate } from '@nestjs/common';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    return user && user.roles.includes('admin');
  }
}
```
This Guard get the user from the reuest and check if it admin or not if he is adming the request proccess else it will block
#### Authorization Guards
We already implemented the `Gues` and the `Authorized` guard. A powerful use of Guards is for Role-Based Access Control (RBAC).     
To check for a specific role:
1. **Define Roles (Metadata):** Use a custom decorator and the `@SetMetadata()` decorator to attach role requirements to a controller method.
2. **Check Roles (Guard):** Create a generic `RolesGuard` that reads this metadata and compares it against the user's roles.
This pattern allows us to define complex access rules with a single line:
```ts
@Post()
@SetMetadata('roles', ['admin', 'manager'])
async create(@Body() createTodoDto: CreateTodoDto) { /* ...*/ }

// 2. The RolesGuard checks if the authenticated user has at least one of these roles
@UseGuards(Authorized, RolesGuard)

@Controller('todos') export class TodoController { /* ... */ }

```
The `@Post()` endpoint has metadata specifying allowed roles (`admin` and `manager`) using `@SetMetadata('roles', [...])`. When a request is made, the `RolesGuard` reads this metadata and checks if the authenticated user (validated by the JWT `AuthGuard`) has at least one of the required roles. If the user doesn't have a matching role, access is denied; otherwise, the action is allowed.
### Interceptors:
Interceptors have two type Interceptors (Post-Controller) and Interceptors (Post-Controller).  
The Post-Controller interceptors run before our controller handler, and in the other hand Post-Controller interceptors run after controller/service returns, to create interceptors we implement the `NestInterceptor`. 
#### Post-Controller Interceptors
Post-Controller interceptors often used to transform the final data structure, ensuring all API responses conform to a unified format (e.g., wrapping data in a `data` key). to create Post-Controller we add our code inside   `next.handle().pipe(`.

```ts
import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface Response<T> { data: T; }
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe( map(data => ({
      statusCode: context.switchToHttp().getResponse().statusCode,
      timestamp: new Date().toISOString(),
      data: data,
      })
    ),
    );
  }
}
```
Here the Post-Controller Interceptors formats every response returned by our controllers. When a request is processed, the interceptor lets the handler run, then uses `map()` to wrap the original response data in a consistent structure. It adds useful extra fields such as the HTTP status code and a timestamp and places the controller's actual output inside a `data` field.
#### Pre-Controller Interceptors
We create Pre-Controller Interceptors same way as before, we just put our logic before `next.handle()`,for example we can create Pre-Controller, to log the requests.
```ts
import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    console.log(`[REQUEST] ${context.getClass().name} starting...`);
    return next.handle();
  }
}
```
This Pre-Controller Interceptor log every request, sent to the server before the controller hanndel them
#### Pre-Controller + Post-Controller Interceptors
Finally we can create mixed Interceptors that run before and after controller, this type of Interceptors for logging the time that controller take to form response
```ts
import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext,next: CallHandler,): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    console.log(
      `[REQUEST] ${request.method} ${request.url} - START`,
    );

    return next.handle().pipe(
      tap(() => {
        const time = Date.now() - start;
        console.log(`[REQUEST] ${request.method} ${request.url} - END (${time}ms)`,);
      }),
    );
  }
}
```
Here create interceptor to log the time that response take ,it get time before the controller run, then after the controller it use ``tap()`` to get substract, the time when the rquest hit controller from the time when it finished making response. and log it to us.  
We can apply these interceptor by using `@UseInterceptors(LoggingTimeInterceptor)` at the controller, method.  
If we want to apply interceptor all over our application we register it in our ``main.ts`` file.
```ts
  // we add this inside the boostrap function
  app.useGlobalInterceptors(new LoggingTimeInterceptor());
```
#### Remark
When working with Pre-Controller Interceptor, we can see we using different function `tap` and `map`, we use ``tap`` when we want side-effect post controller like checking the data without editing it. we use `map` when we want to edit the response structre. 
### Exception Filters
When an exception is thrown in any part of the lifecycle (Pipe, Guard, Interceptor, or Service), NestJS's default handler catches it and sends a generic response. Exception Filters allow us to customize and standardize this error handling globally.
#### Handling and Standardizing Error Responses Globally
By default, NestJS handles built-in exceptions like `NotFoundException` and `BadRequestException` correctly. But we can edit the default behaviour of exception handeling by catching all exceptions and ensure a standard response format, we do that using a global filter.   

**``src/common/filters/http-exception.filter.ts``**
```ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch() // Catches all types of exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? (exception.getResponse() as any)?.message || exception.message : 'Internal server error';

    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
```
In this filter, we create a global exception handler that catches all exceptions thrown by the application. Inside the ``catch`` method, we first switch to the HTTP context and retrieve the request and response objects.  
We then check whether the thrown exception is an instance of ``HttpException``, if it is, we extract the HTTP status code and response message from it, Otherwise, we treat it as an internal server error and use status code 500.

Finally, we send a standardized JSON response that includes:
- the HTTP status code
- a timestamp
- the request path
- a user-friendly error message

This ensures consistent and clean error responses across the entire API.

To use this filter globally, we need to register it in our `main.ts`:
```ts

import { AllExceptionsFilter } from './common/filters/http-exception.filter'; // we import it

  // we add it inside the boostrap function
  app.useGlobalFilters(new AllExceptionsFilter());

```
#### Creating Custom Exception Filters for Specific Errors
We can also create a filter to handle only a specific, non-HTTP exception type from our business logic,Lets create `NotFoundException`, exception filter.

```ts
import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch(NotFoundException ) // Catches all types of exceptions
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    (response.status(404)as any).view("noFound");
  }
}
```
This filter will catch exception that will raise when user visit non exist endpoint and then render the "noFound" template.

we register it in our ``main.ts`` file using
```ts
import { NotFoundExceptionFilter } from './common/filters/noFound-exception.filter'; // we import it

// we register it inside the boostrap function
    app.useGlobalFilters(new NotFoundExceptionFilter());
```
### Custom Parameter Decorators
Custom Parameter Decorators (e.g., `@User()`) abstract away the boilerplate of manually extracting data from the request object in every controller. They leverage the `createParamDecorator` function.

#### Building `@User()` Decorators
Lets create simple `@File()` decorator extract the file from the Form and remove. instead using service

**``src/parameter_decorators/parameter.decorator.form.ts``**
```ts
import { createParamDecorator, ExecutionContext,BadRequestException,InternalServerErrorException } from '@nestjs/common';
import {MultipartFile} from '@fastify/multipart'
export const File = createParamDecorator(

  async (data: unknown, ctx: ExecutionContext):Promise<MultipartFile|null> => {

    const request = ctx.switchToHttp().getRequest(); 
    if (!request.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data.');
    }
    const parts = request.parts();
    try {
      let uploadedCount = 0;
      for await (const part of parts) {
        if (part.type === 'file') {
          return part;
          
        }
      }
      if (uploadedCount === 0) {
        throw new BadRequestException('No file part found in the request.');
        
      }
    } catch (error) {
      console.error('File upload error:', error);
      throw new InternalServerErrorException('File upload failed due to a server error.');
    }
    return null;
}   
)
```
We user Custom Parameter Decorators to retrive the file from the user post request, now we can use this File inside our controller

```ts
import {MultipartFile} from '@fastify/multipart' // we add this
import {File} from 'src/parameter_decorators/parameter.decorator.form' // we import our type


// Our route become as following
@Post('upload')
  @Redirect('/images')
  async uploadImage(@File() file:MultipartFile|null) {
    return this.imageShareService.saveImage(file as MultipartFile)
  }

```
We can see our route become more clean now, we are retriving the file directly by using the File decorator, then inside the controller method we are using ``saveImage`` to save our file.