## Objectives
- Upload and manage files efficiently
- Work with settings files and project configuration

## Upload and Manage Files Efficiently in NestJS
In modern web applications, allowing users to upload files such as images, documents, or other media is a common requirement. **NestJS**, built on top of Express or **Fastify**, offers a powerful and flexible way to handle file uploads. This involves using  **`@fastify/multipart`** to handle `multipart/form-data`, which is primarily used for file uploads.
### Introduction
Handling file uploads introduces challenges like storage management, security (e.g., file type validation, size limits), and performance optimization. NestJS leverages platform-specific libraries:
For Fastify Platform we uses `@nestjs/platform-fastify` and the **`@fastify/multipart`** plugin, which is optimized for performance and lower overhead.
### Creating App
Lets create simple apps that allow us to upload images and display the images that the user uploaded. we start by creating new project using the NestJs Cli
```shell
nest new workshop4
```
### Configuration for File Uploads 
Since the default `@nestjs/platform-express` interceptors (like `FileInterceptor`) are incompatible with Fastify, we must use a Fastify-native approach, typically involving the `@fastify/multipart` plugin or a compatible wrapper.
#### Enable Fastify Adapter
Instead of Multer, Fastify uses the `@fastify/multipart` package. We need to install it and register it via the Fastify Adapter.
```shell
npm install @nestjs/platform-fastify @fastify/multipart
```
Then, configure the application in `main.ts` to use the Fastify Adapter and register the `multipart` plugin:

**`src/main.ts`**
```ts
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Register the fastify-multipart plugin
  await app.register(multipart, {
    // Optional: Configure limits for security
    limits: {
      fileSize: 10 * 1024 * 1024, // e.g., 10 MB limit
    },
  });

  await app.listen(3000);
}
bootstrap();
```
We first set our NestJs app to use `NestFastifyApplication` after that we use the multipart plugin `await app.register(multipart` so we could upload files we add some configuration for the upload functionality , the file size if 10 MB, user can't upload larger fiiles
#### File Storage and Serving
After we setting the upload plugin we need to set additional plugin for serving the files that user upload, we install
```shell
npm install @fastify/static
```
After that we edit the ``main.ts`` to use this plugin.

**`src/main.ts`**
```ts
// src/main.ts (updated)
// ... imports
import fastifyStatic from '@fastify/static';
import { join } from 'path';

async function bootstrap() {
  // ... FastifyAdapter setup

  // Register static assets to serve uploaded files from a 'uploads' directory
  await app.register(fastifyStatic, {
	root: join(__dirname, '..', 'uploads'), // 'uploads' folder relative to dist
	prefix: '/media/', // Files accessible at http://localhost:3000/media/filename.jpg
  });
  // ... rest of the setup
}
```
The application will upload our files to `uploads/`  which live in same level as the `src` folder, the application will server them inder the ``/media`` route
### Setting the Templates
After configuring the file upload we need to, create templates for uplading and displaying the images we want to upload, we start by installing the view plugin and the handelbars engine
```
npm install @fastify/view handlebars
```
Then we add the configuration to our ``main.ts`` file
```ts
// other imports
import fastifyView from '@fastify/view';
import * as handlebars from 'handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
// other code
 app.register(fastifyView, {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), // Path to templates

  });
  
// other code
  
```
This will set the views folder as the template folder, we create and store our template there.
### Setting The main module
We also need to serve styles and other static files for our app so we configure the ``main.ts`` to serve, static files from the ``public`` folder   
First we install the package
```shell
npm install @nestjs/serve-static
```
After that we register the new route by adding the following to our ``main.ts``
```ts
 await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'public'), // 'public' folder relative to dist
    prefix: '/public/', // Files accessible at http://localhost:3000/public/style.css
    decorateReply: false, // Important for registering multiple static routes
  });
```
### Image Sharing Module
After we finish making our configuration we create new module and controller to handel uplading and displaying images, We first creating the files using the following commands
```shell
nest generate module image-share
nest generate controller image-share
nest generate service image-share
```
#### Creating Service
We first need create service to handel saving data, we will use in-memory and store data on list to keep things simple

**`src/image-share/image-share.service.ts`**
```ts
import { Injectable } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface ImageMetadata {
  id: string;
  originalFilename: string;
  mediaPath: string;
}

const images: ImageMetadata[] = [];

@Injectable()
export class ImageShareService {
  async saveImage(file: MultipartFile): Promise<ImageMetadata> {
    
    const fileExtension = file.filename.split('.').pop();
    const uniqueId = randomUUID();
    const newFilename = `${uniqueId}.${fileExtension}`;
    const filePath = join(process.cwd(), 'uploads', newFilename);

    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      file.file.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
    
    const uploadedFile: ImageMetadata = {
      id: uniqueId,
      originalFilename: file.filename,
      mediaPath: `/media/${newFilename}`, 
    };
    
    images.push(uploadedFile); 
    
    return uploadedFile;
  }

  getAllImages(): ImageMetadata[] {
    return images;
  }
}
```
This service handles image uploads and storage.  
We first define an interface that describes the structure of the image metadata we want to store in memory. It includes:
- `id`: a unique identifier for each image
- `originalFilename`: the original name of the uploaded file
Next, we create the service, which contains two main methods:

**`saveImage()`** receives the uploaded file, generates a unique filename, saves the file to the `uploads` directory, and stores its metadata in memory. It then returns the stored information so the client can access the uploaded image it work as following:
- **Extract the file extension**  
    The service reads the original filename and grabs the file extension (e.g., `.png`, `.jpg`) so the new file keeps the correct type.
- **Generate a unique filename**  
    It uses `randomUUID()` to create a unique ID, ensuring no files overwrite each other.  
    Then it combines the ID with the extension to form a new filename like `a1b2c3d4.jpg`.
- **Build the file path**  
    It creates the full path to where the file will be stored inside the `uploads` folder.
- **Save the file to disk**  
    The uploaded file stream is piped into a `createWriteStream`, which writes the file physically on the server's disk.  
    It waits until the file finishes writing, or throws an error if something goes wrong.
- **Create metadata**  
    After the file is saved, it builds an object containing:
    - The unique ID
    - The original filename
    - The publicly accessible media path (e.g., `/media/a1b2c3d4.jpg`)
- **Store metadata in memory**  
    This metadata object is pushed into the `images` array, acting like a temporary database.
- **Return the image metadata**  
    Finally, it returns the metadata so the controller can send a response to the user.

**`getAllImages()`**  returns all saved image metadata from our in-memory list, allowing us to retrieve and display all uploaded images.
#### Creating The Controller
Now we create the controller to handel our requests
**`src/image-share/image-share.controller.ts`**
```ts
import {Render,Redirect, Controller, Post, Get, Req, Res, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ImageShareService, ImageMetadata } from './image-share.service'; // Import the Service

@Controller('images')
export class ImageShareController {
  constructor(private readonly imageShareService: ImageShareService) {}

  @Get()
  @Render('upload')
  async getUploadForm(@Res({passthrough:true}) res: FastifyReply) {
    const images: ImageMetadata[] = this.imageShareService.getAllImages();
    return { images };
  }

  @Post('upload')
  @Redirect('/images')
  async uploadImage(@Req() req: FastifyRequest, @Res({passthrough:true}) res: FastifyReply) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data.');
    }

    try {
      const parts = req.parts();
      let uploadedCount = 0;
      for await (const part of parts) {
        if (part.type === 'file') {
          await this.imageShareService.saveImage(part);
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
This controller manages the routes for uploading and displaying images. It works alongside the `ImageShareService` to handle incoming requests, show uploaded images, and process file uploads from users.

We first inject the `ImageShareService` so the controller can call its methods to save files and retrieve stored image data.

The controller contains two main route handlers:

**`@Get()`  Display the upload form and images:**

This method renders an HTML page that shows the upload form and previously uploaded images.

- **Fetch stored images**  
    It calls `getAllImages()` from the service to retrieve all saved image metadata.
    
- **Render the template**  
    It uses `res.view()` to render the `upload` page and passes the list of images so they can be displayed in the UI.
    

**`@Post('upload')` Handle file uploads**

This method receives the uploaded file from the user and saves it using the service.

It works as follows:

- **Check request format**  
    Ensures the request is `multipart/form-data` (required for file uploads). If not, it throws a `BadRequestException`.
    
- **Process incoming file parts**  
    Uses `req.parts()` to loop through incoming parts of the request and look for a file upload.
    
- **Save uploaded file**  
    When it finds a file part, it calls `saveImage()` from the service to store the file and metadata, then increases `uploadedCount`.
    
- **Handle missing file**  
    If no file is found in the request, it throws a `BadRequestException` to notify the client.
    
- **Redirect after success**  
    Once the file is uploaded successfully, it redirects the user back to `/images` so they can see the uploaded image.
    
- **Error handling**  
    Catches any internal error during the upload process, logs it, and returns an `InternalServerErrorException` if something goes wrong.

### Creating the Templates
Now finally we create the template, to display the form that upload files and display all uploaded images.

**`views/upload.hbs`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Uploader</title>
    <link rel="stylesheet" href="/public/style.css"> </head>
<body>
    <h1>Image Uploader </h1>
    
    <div class="upload-section">
        <h2>Upload a New Image</h2>
        <form action="/images/upload" method="POST" enctype="multipart/form-data">
            <input type="file" name="file" accept="image/*" required>
            <button type="submit">Upload Image</button>
        </form>
    </div>

    <hr>

    <div class="gallery">
        <h2>Uploaded Images ({{images.length}})</h2>
        {{#if images}}
            <div class="image-grid">
                {{#each images}}
                <div class="image-card">
                    <p class="filename">{{this.filename}}</p>
                    <img src="{{this.mediaPath}}" alt="{{this.filename}}">
                    <p class="path-info">Path: <code>{{this.mediaPath}}</code></p>
                </div>
                {{/each}}
            </div>
        {{else}}
            <p>No images have been uploaded yet.</p>
        {{/if}}
    </div>
</body>
</html>
```
#### Styles
For styles we use the style from the materials folder


## Project Configuration in NestJS
In the previous sections, we built applications using default NestJS settings and the Fastify platform. While these defaults are excellent for getting started, real-world projects require more specific configurations for handling static assets, connecting to various databases, managing environment variables, and organizing module-based routing.
### Static Files and Assets Configuration
In NestJS especially when using the Fastify adapter, we use a specific plugin, **`@fastify/static`** to help use serve static files,  we register it our `main.ts` file to map a file system folder to a public URL route.  
#### Serving Static Assets (CSS, JS, Logos)
In NestJS, we centralize our application's design assets (CSS, JavaScript, logos) in a directory (commonly named `public/`) at the project root. We use the **`@fastify/static`** plugin to serve this folder.

**Implementation in `src/main.ts`**
We must install the package and register it with the Fastify adapter:
```
npm install @fastify/static
```
Then we configure it in our main.ts file as following
```ts

await app.register(fastifyStatic, {
root: join(__dirname, '..', 'public'), // 'public' folder relative to dist
prefix: '/public/', // Publicly accessible at http://localhost:3000/public/
decorateReply: false, // Important for registering multiple static roots
});

```
- **`root`**: Defines the **physical source** directory on our server's disk (`public` or `uploads`).
    
- **`prefix`**: Defines the **URL path** through which the files will be accessible in the browser (e.g., `/public/style.css`).

### Templates and View Engine Configuration
In a NestJS application configured to serve server-side rendered (SSR) views (as shown with Handlebars in the previous guide), we explicitly configure the view engine and the template source folder. This is managed by the **`@fastify/view`** plugin.
#### Centralized Templates Directory
To ensure all modules can share layout files (like `base.hbs`) and view components, we define a single `views` directory at the project root.

**Implementation in `src/main.ts`**

We must install the package and configure it in `main.ts` (along with the required view engine, e.g., Handlebars):

```
npm install @fastify/view handlebars
```
Then we configure our the `views` folder to hold our templates as following
```ts
// src/main.ts (View Engine configuration)
// ... imports
import fastifyView from '@fastify/view';
import * as handlebars from 'handlebars';

async function bootstrap() {
  // ... Adapter setup

  await app.register(fastifyView, {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), // Path to centralized templates
  });
  
  // ... rest of setup
}
```
- **`templates: join(__dirname, '..', 'views')`**: This setting tells the view engine where to find our Handlebars files. This centralized location makes sharing templates, such as a main `base.hbs` layout, simple and clean across all our application modules.    
- The **`@Render()`** decorator in our controllers will look for the specified file name inside this central directory.
    
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