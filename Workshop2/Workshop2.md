## Objectives
- Rendering and Returning Views
- Integrating a View Template Engine 
- Managing and Serving Static Files 
- Handling User Input with DTOs and Validation

## Rendering and Returning Templates 
In our previous session, we returned simple strings from our controllers (e.g., `return 'Hello World!';`). While perfect for simple tests or APIs, most web applications need to display rich, structured content. To achieve this, we use HTML templates, often referred to as **views**.  
A template is an HTML file where we can embed dynamic data before sending it to the user's browser. NestJS is platform-agnostic and allows us to plug in various template engines like Handlebars (HBS), EJS, or Pug.  
This approach keeps our application's logic (written in TypeScript) separate from its presentation (written in HTML/Handlebars), making our code cleaner and easier to maintain.
### Rendering Views with a Template Engine
To render and return an HTML template, we first need to install and configure a template engine adapter. We will use Handlebars with Fastify.
First, install the necessary packages:
```
npm install @nestjs/platform-fastify @fastify/view handlebars
```
Next, we must configure our application in `main.ts` to use this engine and tell it where to find our templates.
**`src/main.ts`**
```ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';
import fastifyView from '@fastify/view';
import * as handlebars from 'handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Register the view engine
  app.register(fastifyView, {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), // Path to templates
  });

  await app.listen(3000);
}
bootstrap();
```
Here we initializes our NestJS application using Fastify instead of the default Express server. NestFactory is used to create the application instance, and by passing the `FastifyAdapter`, the application runs on Fastify, which is known for its high performance and low overhead. `NestFastifyApplication` is used as a type to ensure the application works correctly with Fastify-specific features.  
After creating the application, the code registers the Fastify view engine plugin (`@fastify/view`). This plugin allows the server to render HTML templates instead of only returning JSON responses. The Handlebars engine is provided in the configuration, enabling template rendering with `.hbs` files. The `templates` option specifies the directory where view templates are stored; here, `join` is used to build a correct file path pointing to a `views` folder in the project.  
Finally, the application starts listening on port `3000`, making the server accessible in the browser. With this setup, the NestJS application can return rendered HTML pages from controllers, using Fastify for efficiency and Handlebars for dynamic server-side views.
### The `views` Folder
We configured NestJS to look for templates in a folder named `views` at the root of our project (at the same level as `src`).  We will have all our templates in single, global views folder. But we can still create subfolders within views for organization (e.g., views/user/profile.hbs).
### Setting Up The Controller
Let's put this into practice. We'll assume we have a new NestJS project. We will modify the default `AppController` to render a template.      
Let's edit our controller to serve a template on the `app1` route.

**`src/app.controller.ts`**
```ts
import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('app1') 
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  index() {
    return {}; 
  }
}
```
The **`index`** function uses the **`@Render()`** decorator. This decorator handles the rendering and returns the final HTML.
1. **`@Controller('app1')`**: Makes all routes in this class start with `/app1`.
2. **`@Get()`**: Binds this method to handle `GET` requests for the controller's root (which is now `/app1`).
3. **`@Render('index')`**: This is the key. It tells NestJS to find a template named `index` (it will add the `.hbs` extension automatically) in our `views` folder, render it, and send it as the response.
4. **`return {};`**: This is the **context** (the data you want to pass to the template).

With this setup, when we visit `http://localhost:3000/app1/`, NestJS will route the request to the `index` method, which renders and returns the `index.hbs` template.
### Creating The Template
Next, we’ll create our template. At the **root** of your project (outside `src`), create a folder named `views`. Inside that `views` folder, create the file `index.hbs`.
**`views/index.hbs`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Template</title>
</head>
<body>
    <h1>Welcome to Our Website!</h1>
    <p>This page was rendered from a NestJS template.</p>
</body>
</html>
```
### Running The App
Now we can run our NestJS development server using:
```shell
npm run start:dev
```
Once the server is running, open your browser and visit **`http://127.0.0.1:3000/app1/`**. We should see the content of our `index.hbs` template displayed on the page.

## Handlebars Template Engine
### Using Modules
Before we start working with handlebars  templates engine features, let's quickly discuss organization. As our application grows, if we keep putting all our logic and routes (like `/app1`, `/app2`, `/users`, etc.) into the single `app.controller.ts` file, it will become massive, messy, and hard to maintain. This is often called **"spaghetti code."**  
NestJS is designed to prevent this by using Modules. The best practice is to create a new, self-contained feature module (like an `App1Module`) for each major feature of your application. That module would then have its own dedicated controllers and services.  
#### Creating Module
Let’s create our first feature module and move our route logic into it.    
Generate a new module using the Nest CLI:
```shell
nest g module app1
```
This command creates a new folder `src/app1` and, inside it, a file named `app1.module.ts`. It also automatically updates our root `app.module.ts` to import this new module.     
After this  we create a controller for the new module:
```shell
nest g controller app1 --no-spec
```
This command does two things:
- It creates the file `src/app1/app1.controller.ts`.
- It automatically updates `app1.module.ts` to declare this new controller.

After running these commands, our `app.module.ts` will look something like this:
**`src/app.module.ts`**
```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { App1Module } from './app1/app1.module'; // <-- CLI added this line

@Module({
  imports: [App1Module], // <-- And this line
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
And our new `app1.module.ts` will be correctly set up to manage its own controller:
**`src/app1/app1.module.ts`**
```ts
import { Module } from '@nestjs/common';
import { App1Controller } from './app1/app1.controller';

@Module({
  controllers: [App1Controller] // <-- CLI added this line
})
export class App1Module {}
```
Now, all logic for the `/app1` route can be placed inside `App1Controller`, keeping our main `AppController` clean and focused.  
Now we can move our route logic to this new module's controller:  
``src/app1/app1.controller.ts``
```ts
import { Controller, Get, Render  } from '@nestjs/common';

@Controller('app1')
export class App1Controller {
  @Get()
  @Render('index')
  index() {
    return {};
  }
}
```
This means whenever a user visits `/app1`, this controller will respond and render the `index` template.     
Since the logic moved, we remove it from the main controller:
``src/app.controller.ts``
```ts
import { Controller} from '@nestjs/common';
import { AppService } from './app.service';
  
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

}
```
### Working with Handlebars Template Engine
With NestJS and the `@fastify/view` plugin we've configured, we can do much more than just render static HTML. The Handlebars engine allows us to build dynamic and reusable pages. Using this engine, we can insert variables (called **expressions**), apply conditions, and loop through data (using **block helpers**), and even define reusable layouts and components (using **partials**).
### Passing Data to Views
In NestJS, we can display dynamic data passed from the controller using the context object. This is the object we `return` from a controller method that is decorated with `@Render()`.  
For example, let's update our `App1Controller` to pass username and age to our template  
**`src/app1/app1.controller.ts`**
```ts
import { Controller, Get, Render } from '@nestjs/common';

@Controller('app1')
export class App1Controller {
  
  @Get()
  @Render('index') // Renders 'views/index.hbs'
  index() {
    // This returned object is the context
    return {
      username: 'Alice',
      age: 25
    };
  }
}
```
Here, we updated our `index` method to return an object. This object is the **context** that holds our dynamic data. The `@Render()` decorator makes this data available inside the `index.hbs` template.     
We can then access these variables in our template using double curly braces (`{{ }}`):  
**`views/index.hbs`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Template</title>
</head>
<body>
    <h1>Welcome {{username}}!</h1>
    <p>You are {{ age }} years old.</p>
</body>
</html>
```
When rendered, Handlebars replaces `{{username}}` and `{{age}}` with the actual values from the context object.
### Using Conditions
The Handlebars engine also allows us to add **conditions** to our HTML templates using block helpers, making our pages more dynamic.   
We can use helpers like `{{#if}}`, `{{else if}}`, and `{{else}}` to control what content is displayed.  
#### Example
Let’s create a new module called `app2`. We'll use the Nest CLI:
```shell
nest g module app2
nest g controller app2 --no-spec
```
After this lets set up a dynamic route in our new controller.  
**`src/app2/app2.controller.ts`**
```ts
import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('app2')
export class App2Controller {

  @Get(':role') 
  @Render('app2/index')
  index(@Param('role') role: string) {
    const context = {
      isAdmin: role === 'admin',
      isEditor: role === 'editor',
      isViewer: role === 'viewer',
    };
    return context;
  }
}
```
After that, let's create our template (you may need to create the `views/app2` folder):  
**`views/app2/index.hbs`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>App 2</title>
</head>
<body>
    {{#if isAdmin}}
        <h1>Welcome, Admin!</h1>
        <p>You have full access to the system.</p>
    {{else if isEditor}}
        <h1>Welcome, Editor!</h1>
        <p>You can edit and manage content.</p>
    {{else if isViewer}}
        <h1>Welcome, Viewer!</h1>
        <p>You can browse and read the available content.</p>
    {{else}}
        <h1>Welcome, Guest!</h1>
        <p>Your role is not recognized. Please log in or contact the administrator.</p>
    {{/if}}
</body>
</html>
```
Here we are using Handlebars' `{{#if}}`, `{{else if}}`, and `{{else}}` helpers to display different messages based on the booleans passed from the controller.   
When a user visits `/app2/admin/` or `/app2/viewer/`, NestJS will render the appropriate message dynamically.
#### Notice
The basic Handlebars `{{#if}}` helper only checks for "falsy" values (like `false`, `null`, `undefined`, `0`, or an empty string). It cannot do direct comparisons like `==`. to handle this, the common practice is to pass booleans from the controller.

### Using Loops
Handlebars also allows us to loop through data (like arrays) in our templates. This is essential for displaying lists, tables, or collections of items.   
We use the `{{#each}}` block helper to iterate over data.
#### Example
Now, let’s create a new module called `app3`.
```shell
nest g module app3
nest g controller app3 --no-spec
```
Next, we’ll configure the `app3.controller.ts` file to pass a list of items to our template.  
**`src/app3/app3.controller.ts`**
```ts
import { Controller, Get, Render } from '@nestjs/common';

@Controller('app3')
export class App3Controller {

  @Get()
  @Render('app3/index') // Renders 'views/app3/index.hbs'
  index() {
    const context = {
      fruits: ['Apple', 'Banana', 'Cherry', 'Mango', 'Orange']
      // fruits: [] // Try this to test the 'else' block
    };
    return context;
  }
}
```
Now let’s create our template (create the `views/app3` folder):
**`views/app3/index.hbs`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>App 3 - Using Loops</title>
</head>
<body>
    <h1>Available Fruits</h1>
    <ul>
        {{#each fruits}}
            <li>{{this}}</li>
        {{else}}
            <li>No fruits available at the moment.</li>
        {{/each}}
    </ul>

    <p>Total fruits: {{fruits.length}}</p>
</body>
</html>
```
Here, we’re using the `{{#each fruits}}` helper to loop through each item in the `fruits` list. Inside the loop, `{{this}}` refers to the current item (the fruit string).  
We also added the `{{else}}` block, which Handlebars renders if the `fruits` array is empty .  
Finally, we used `{{fruits.length}}` to display the total number of fruits.
### Including Template Parts 
In larger projects, many pages share the same layout, like a common header, navigation bar, or footer.  Handlebars allows us to create reusable "components" called **Partials**. to use partials, we first need to tell Handlebars where to find them by updating our `main.ts` configuration.
**`src/main.ts`** (Updated)
```ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';
import fastifyView from '@fastify/view';
import * as handlebars from 'handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Register the view engine
  app.register(fastifyView, {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'),
    // --- NEW CONFIGURATION ---
    // We tell Handlebars to look for partials in this directory
    options: {
      partials: {
	    navbar: 'partials/navbar.hbs',
	    footer: 'partials/footer.hbs'

      },
      },
    },
    // -------------------------
  });

  await app.listen(3000);
}
bootstrap();
```
We add a configuration section for partials using the `options` property. Inside it, we define a `partials` object where we specify two things: the `navbar` and `footer` and we set as value to them the path.
Now, at the root of our project, we create a `views/partials` folder. In this folder, we’ll place our reusable components.  
**`views/partials/navbar.hbs`**
```html
<nav>
    <a href="/app1">App 1</a> |
    <a href="/app2/viewer">App 2</a> |
    <a href="/app3">App 3</a>
</nav>
```
**`views/partials/footer.hbs`**
```html
<footer>
    <p>&copy; 2025 My NestJS Website</p>
</footer>
```
We can now include these partials in any other template using the `{{> partialName}}` syntax. Let's update our `app1` template:
**`views/index.hbs`** 
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Template</title>
</head>
<body>
    <header>
        <h1>My Website</h1>
        {{> navbar}}
    </header>

    <main>
        <h1>Welcome {{username}}!</h1>
        <p>You are {{ age }} years old.</p>
    </main>

    {{> footer}}
</body>
</html>
```
Here, `{{> navbar}}` and `{{> footer}}` tell Handlebars to find, render, and inject the content of those partial files at that exact location.   
### Using a Global Layout 
Partials are great for small components, but our `views/index.hbs` file still has to repeat all the boilerplate HTML (`<html>`, `<head>`, `<body>`). If we create another page, like `about.hbs`, we'd have to repeat it all again.  
We can solve this by creating a main `layout.hbs` file. This file will contain all the common HTML, and a special placeholder where our individual page content will be injected. The `@fastify/view` plugin handles this using a special `{{{ body }}}` expression.  
#### Update `main.ts` to Use a Layout
First, we need to tell NestJs to use this layout file by default. We update our `main.ts` one more time:  
**`src/main.ts`** (Final Update)
```ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';
import fastifyView from '@fastify/view';
import * as handlebars from 'handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Register the view engine
  app.register(fastifyView, {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'),
    // --- NEW LAYOUT CONFIGURATION ---
    layout: 'layout', // Use 'views/layout.hbs' as the default layout
    // --------------------------------
    options: {
      partials: {
        navbar: 'partials/navbar.hbs',
	    footer: 'partials/footer.hbs'
      },
    },
  });

  await app.listen(3000);
}
bootstrap();
```
The new **`layout: 'layout'`** line tells the view engine to look for a file named `layout.hbs` in the root `views` directory and wrap all rendered templates with it.
#### Create the `layout.hbs` File
Now, let's create this main layout. This file will now be the one that includes our partials.   
**`views/layout.hbs`** (New File)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My NestJS Website</title>
</head>
<body>
    <header>
        <h1>My Website</h1>
        {{> navbar}}
    </header>

    <main>
        {{{ body }}}
    </main>

    {{> footer}}
</body>
</html>
```
The most important part is **`{{{ body }}}`**. This is the placeholder. The **triple-stash `{{{`** is crucial—it tells Handlebars to inject the HTML content _without_ escaping it (unlike the double-stash `{{`), which is what we want for injecting our page's HTML.
#### Simplify Our Page Templates
Finally, we can clean up our `views/index.hbs` file completely. It no longer needs any boilerplate—just the unique content for that page.     
**`views/index.hbs`** (Simplified)  
```html
<h1>Welcome {{username}}!</h1>
<p>You are {{ age }} years old.</p>
```
Now, when NestJS renders the `index` template:
1. It processes `views/index.hbs` to get its content.
2. It loads `views/layout.hbs` (because of our config).
3. It injects the content from `index.hbs` into the `{{{ body }}}` placeholder.
4. It also processes the `{{> navbar}}` and `{{> footer}}` partials.
5. The final, complete HTML page is sent to the browser.

This component-based and layout-based approach helps keep your templates **modular**, **clean**, and **easy to maintain**.
#### Notice
By setting the `layout: 'layout'` option in `main.ts`, that layout file will **automatically** wrap all templates rendered by your controllers.

## Managing and Serving Static Files

The NestJS framework, when paired with a template engine like **Handlebars (hbs)**, helps us build dynamic templates that change depending on the provided data. However, real web applications also need **styles**, **images**, and sometimes **videos** to enhance the user experience. These files, which don’t change dynamically, are called **static files**. NestJS provides a simple and efficient way to manage and serve these static files, such as **CSS**, **JavaScript**, and **images**, using a dedicated module.
### Setting Up Static Files and Views
In NestJS, this setup is typically handled at the root of the project rather than within each individual module We use the `@nestjs/serve-static` package to handle static assets and a package like `hbs` to handle template rendering.   
First, you need to install the necessary packages:
```
npm install @nestjs/serve-static @fastify/static
```
#### Configuring the Static Module
After installing the packages we configure static file serving in our main **`app.module.ts`**. This tells NestJS to find a specific folder (usually named `public`) and make all its contents available at the root URL.  
**`src/app.module.ts`**
```ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// ... import your App1Module, App2Module, App3Module

@Module({
  imports: [
    // This module serves static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    App1Module, 
    App2Module, 
    App3Module
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```
Here we include the `ServeStaticModule` to allow NestJS to serve static files directly from the server, such as images, CSS, JavaScript files, and other public assets. The `rootPath` option points to the `public` directory in our project, meaning any files inside that folder can be accessed by the browser without needing a controller or route. After setting this up, the rest of the modules (like `App1Module`, `App2Module`, and `App3Module`) are imported normally to provide the main application functionality.
### Creating the Styles File
Next, let’s create a **CSS file** that will define the styles for our page. We’ll name it **`style.css`** and place it inside the **`public/css/`** folder.    
**`public/css/style.css`**
```css
body {
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    text-align: center;
    margin: 50px;
}

h1 {
    color: #2c3e50;
}

img {
    width: 150px;
    margin-top: 20px;
}
```
This stylesheet controls the appearance of our webpage. It sets a clean background, centers the content, and styles the heading and image for a simple, modern look.
### Updating the Template
Now that our static files configuration is set, it’s time to use them in a Handlebars template. We will  update the ``layout.hbs`` to loads a CSS stylesheet and image as page logo.   
**`views/layout.hbs`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My NestJS Website</title>
	<link rel="stylesheet" href="/css/style.css">
    <link rel="icon" type="image/x-icon" href="/images/logo.png">
</head>

<body>
    <header>
        <h1>My Website</h1>
        {{> navbar}}
    </header>
    <main>
        {{{ body }}}
    </main>
    {{> footer}}

</body>
</html>
```
When the browser requests `/css/style.css`, NestJS automatically finds and serves the file at `public/css/style.css`. Similarly, it maps the request for `/images/logo.png` to the file at `public/images/logo.png`.

## Handling User Input with Forms
So far, our NestJS apps have focused on displaying data to users rendering templates, managing static files, and serving dynamic content. However, real-world web applications also need to receive data from users, process it, and often save it or use it to produce a result. The most common way to collect user input is through HTML forms. NestJS provides robust support for handling forms using Controllers to receive data and DTOs (Data Transfer Objects) with Pipes to validate it.
### Create a Feedback Module
Let’s create a new module called `feedback` that allows users to submit their feedback and enables us to store and view these submissions. First, create the module, controller, and service using the Nest CLI:
```ts
nest g module feedback
nest g controller feedback
nest g service feedback
```
Here the `nest g service feedback` command used to generate a new service for our module, it automatically creates a `feedback.service.ts` file along with its test file,This service will contain the business logic related to handling feedback in the application.
### Creating The Templates
After setting up our module, it’s time to create the templates in the `views` folder. We’ll need two templates:
1. One for the feedback form (`form.hbs`).
2. Another for displaying submitted feedback (`feedbacks.hbs`).

**`views/feedback/form.hbs`**
```html
<h1>We Value Your Feedback</h1>

<form method="POST">
    <input type="text" name="name" placeholder="Your Name" required><br><br>
    <input type="email" name="email" placeholder="Your Email" required><br><br>
    <textarea name="message" rows="5" placeholder="Your Feedback" required></textarea><br><br>
    <button type="submit">Submit</button>
</form>
```
This template displays a simple HTML form. When the user submits, the data will be sent to the server using the **POST** method and handled by our `FeedbackController`.    
**`views/feedback/feedbacks.hbs`**
```html
<h1>Submitted Feedback</h1>
    <ul>
        {{#each feedback_list}}
            <li>
                <strong>{{this.name}}</strong> ({{this.email}})<br>
                {{this.message}}
            </li>
            <hr>
        {{else}}
            <li>No feedback has been submitted yet.</li>
        {{/each}}
    </ul>
```
This template loops through the list of submitted feedback entries using Handlebars' `{{#each}}` helper. If no feedback has been submitted, the `{{else}}` block displays a message.
### Creating The Service
We worked with controller before but alone it isn't eough, the controller's job is to handle requests (routing), not to manage data. A service's job is to handle business logic (like saving to a database or, in our case, an in-memory list).    
Our service will manage our data. For now, it will just keep an in-memory list, acting as our temporary "database."
**`src/feedback/feedback.service.ts`**
```ts
import { Injectable } from '@nestjs/common';

export interface Feedback {
  name: string;
  email: string;
  message: string;
}

@Injectable()
export class FeedbackService {
  private readonly feedbacks: Feedback[] = [];

  addFeedback(feedback: Feedback) {
    this.feedbacks.push(feedback);
  }

  getAllFeedback(): Feedback[] {
    return this.feedbacks;
  }
}
```
We start by defining a simple `Feedback` interface that represents the shape of the data we want to store each feedback entry will contain a `name`, an `email`, and a `message`.    
Next, we create the `FeedbackService` class and decorate it with `@Injectable()`.  
This tells NestJS that this class is a **service**, meaning it can be injected into other parts of the application (like our controller) so they can use its functionality.   
Inside the service, we define a private list called `feedbacks`. we marked it `private readonly`, which means:
- Only this class can access it directly (not controllers or other files)
- The reference to the array cannot be reassigned but we can still push new feedback objects into it

This list acts as our in-memory “database” for now.   
Finally, we create two public methods:
- ``addFeedback()`` Accepts a new feedback object and stores it in the list
- ``getAllFeedback()`` Returns all stored feedback so our controller can display it

### Creating The Controller
Finally, we need to create the controller. Its job is to handle incoming user requests, use the `FeedbackService` to store or retrieve data, and then return the correct template to the user.  
**`src/feedback/feedback.controller.ts`**
```ts
import { Controller, Get, Post, Render, Body, Redirect } from '@nestjs/common';
import { FeedbackService, type Feedback } from './feedback.service';

@Controller('feedback') 
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @Render('feedback/form') 
  showFeedbackForm() {
  }
  
  @Post()
  @Redirect('feedback/feedbacks') 
  handleFeedbackSubmission(@Body() body: Feedback) {
 
    this.feedbackService.addFeedback(body);
  }

  @Get('feedbacks')
  @Render('feedback/feedbacks') 
  showFeedbackList() {
    const feedback_list = this.feedbackService.getAllFeedback();

    return { feedback_list: feedback_list };
  }
}
```
First we import by importing the decorators  `import { Controller, ... } from '@nestjs/common';`: This line imports all the decorators we need from NestJS to define our routes (`@Controller`, `@Get`, `@Post`), handle request data (`@Body`), and send responses (`@Render`, `@Redirect`).   
After this we added additional import for service file functionality `import { FeedbackService, type Feedback } from './feedback.service';`
- **`FeedbackService`**: This is the class itself, which we need for dependency injection.
- **`type Feedback`**: We use the `type` keyword because `Feedback` is an **interface**, not a class or a value that exists at runtime. 

Then we used  `@Controller('feedback')` decorator to set the base URL for all routes in this file.   
Inside the `constructor`, we use Dependency Injection by declaring `private readonly feedbackService: FeedbackService`. NestJS sees this, finds the `FeedbackService` (which we marked as `@Injectable()`), and automatically "injects" its instance for us to use.

Finally we defined three route handlers:   

**`showFeedbackForm`**: A `GET` request mapped to `/feedback`. The `@Render('feedback/form')` decorator tells NestJS to render our `form.hbs` template.

**`handleFeedbackSubmission`**: This `POST` route is also mapped to `/feedback`.
- It uses the `@Body()` decorator to parse the form data from the request body and assign it to the `body` parameter (which we've typed as `Feedback`).
- It then **delegates** the work by passing this data to `this.feedbackService.addFeedback()`.
- The `@Redirect('feedback/feedbacks')` decorator then automatically sends the user's browser to our feedback list page.


**`showFeedbackList`**: A `GET` route mapped to `/feedback/feedbacks`.
- It delegates by asking the service for all feedback using `getAllFeedback()`.
- It then passes the returned list to the `feedbacks.hbs` template by returning an object. NestJS injects `{ feedback_list: ... }` as context for the template.


### CSRF Protection
#### What Is CSRF?
CSRF (Cross-Site Request Forgery) is an attack that tricks a logged-in user into performing unwanted actions on a website where they’re authenticated. NestJS don't includes built-in CSRF protection by default to prevent this. We must add it to our webapp manually.
#### Adding CSRF Protection
Let's secure our app against Cross-Site Request Forgery (CSRF) attacks. Since we're using Fastify with NestJs, we'll use the native `@fastify/cookie` and `@fastify/csrf-protection` plugins.    
We need to install the Fastify plugins for handling cookies and CSRF.
```
npm install @fastify/cookie @fastify/csrf-protection
```
After this we need to register these plugins with our Fastify instance in `main.ts`.   
**`src/main.ts`**
```ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';
import fastifyView from '@fastify/view';
import * as handlebars from 'handlebars';

// We add this
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';
  
  

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
  // We register the plugin
  await app.register(fastifyCookie);
  await app.register(fastifyCsrf);
  
  await app.listen(3000);

}

bootstrap();
```
We start by importing the plugin that we installed then we register them using the `app.register()`.    
Now, Now we need to use those plugin
#### Creating Guard
A **Guard** in NestJS is a special type of class annotated with `@Injectable()` that implements the `CanActivate` interface. Guards have a single responsibility: to determine whether a given request should be handled by the route handler or not. This is often referred to as authorization.  
- **Execution Order:** Guards are executed **after** all global/per-route middleware but **before** any Interceptors or Pipes. They are the first line of defense before the business logic of your controller method.
- **The Power of `canActivate()`:** A Guard's core method is `canActivate()`. It receives the request context and must return a boolean (or a `Promise<boolean>` or `Observable<boolean>`).
    - If it returns `true`, the request proceeds.
    - If it returns `false` (or throws an exception like `ForbiddenException`), NestJS immediately denies the request and returns the appropriate HTTP status code.

Lets create Guard to handel the csrf protection.   
**`src/feedback//fastify-csrf.guard';`**
```ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';


@Injectable()
export class FastifyCsrfGuard implements CanActivate {

  constructor(private readonly adapterHost: HttpAdapterHost) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<FastifyRequest>();
    const res = httpContext.getResponse<FastifyReply>();
    const fastifyInstance = this.adapterHost.httpAdapter.getInstance();
    const csrfProtection =  (fastifyInstance as any).csrfProtection;
    if (!csrfProtection) {
        throw new ForbiddenException('CSRF protection is not initialized.');
    }
    return new Promise((resolve, reject) => {
      csrfProtection(req, res, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
  }
}
```
Here we defined a custom CSRF guard for a NestJS application running with Fastify. In NestJS, guards decide whether a request is allowed to continue, and this guard checks if a valid CSRF token is present. It first gets access to the current HTTP request and response objects from the execution context.
```ts
const req = httpContext.getRequest<FastifyRequest>();
const res = httpContext.getResponse<FastifyReply>();
```
Then, using the `HttpAdapterHost`, it retrieves the Fastify instance to access the `csrfProtection` middleware.
```ts
const fastifyInstance = this.adapterHost.httpAdapter.getInstance();
const csrfProtection = (fastifyInstance as any).csrfProtection;
```
If CSRF protection is not properly initialized in Fastify, it immediately throws a `ForbiddenException`.
```ts
if (!csrfProtection) {
	throw new ForbiddenException('CSRF protection is not initialized.');
}
```
Otherwise, it runs the Fastify CSRF protection function, which checks if the incoming request includes a valid CSRF token
```ts
return new Promise((resolve, reject) => {
  csrfProtection(req, res, (err) => {
	if (err) {
	  return reject(err);
	}
	resolve(true);
  });
});
```
If the token is missing or invalid, the request is blocked; if the check succeeds, the guard allows the request to proceed. This ensures that only trusted requests with valid CSRF tokens can reach the protected routes.
#### Adding the CSRF Token
Now we apply our `FastifyCsrfGuard` to the post route we do that by adding `@UseGuards(FastifyCsrfGuard)` after the `@Post()` decorator.  
**`src/feedback/feedback.controller.ts`**
```ts
import { Controller, Get, Post, Res,Render, Body, Redirect,UseGuards } from '@nestjs/common';
import { FeedbackService, type Feedback } from './feedback.service';
import { FastifyCsrfGuard } from './fastify-csrf.guard';
import type{ FastifyReply} from 'fastify';

@Controller('feedback')
export class FeedbackController {
	constructor(private readonly feedbackService: FeedbackService) {}
	
	@Get()
	@Render('feedback/form')
	async showFeedbackForm(@Res({ passthrough: true }) res: FastifyReply) {
		const csrfToken = await res.generateCsrf();
	    return { csrfToken };
	}
	
	@Post()
	@UseGuards(FastifyCsrfGuard)
	@Redirect('feedback/feedbacks')
	handleFeedbackSubmission(@Body() body: Feedback) {
		this.feedbackService.addFeedback(body);
	}
	
	@Get('feedbacks')
	@Render('feedback/feedbacks')
	showFeedbackList() {
		const feedback_list = this.feedbackService.getAllFeedback();
		return { feedback_list: feedback_list };
	}

}
```
We also need to update the `feedback/form` route we add crsfToken and return it as context  the token is generated using `reply.generateCsrf()`. 
```ts
const csrfToken = await res.generateCsrf();
return { csrfToken };
```
To access the `reply` object, we inject it with the `@Res()` decorator. This also means our handler must become `async`.
```ts
async showFeedbackForm(@Res({ passthrough: true }) res: FastifyReply)
```
`@Res({ passthrough: true }) res: FastifyReply` tells NestJS to give us the Fastify response object inside our controller method, Normally, when you use `@Res()`, NestJS expects us to handle the whole response manually (like `res.send()`), and we cannot just `return` data. But when we set `passthrough: true`, we get the response object and we can still return a normal value from the method.
#### Update Template 
Finally we need to update our `form.hbs` template so it include the csrf token , we do that by adding a hidden input field to our form containing the token. The plugin automatically looks for a field named `_csrf`.    
**`src/views/feedback/form.hbs`**
```html
<h1>We Value Your Feedback</h1>

<form method="POST">
	<input type="hidden" name="_csrf" value="{{ csrfToken }}">

	<input type="text" name="name" placeholder="Your Name" required><br><br>
	<input type="email" name="email" placeholder="Your Email" required><br><br>
	<textarea name="message" rows="5" placeholder="Your Feedback" required></textarea><br><br>
	<button type="submit">Submit</button>
</form>
```
Now, when we load the form, the server generates a token, which is embedded in the HTML. When we submit the form, this token is sent back, and the `@fastify/csrf-protection` plugin validates it automatically before our `handleFeedbackSubmission` handler ever runs.

### Using DTOs for Validation 
Our current application relies only on front-end validation (e.g., using HTML `required` attributes or JavaScript checks). While helpful for user experience, this approach is trivial to bypass. A malicious user can easily edit the HTML to submit invalid or empty data, which our service would currently accept without question.  
To fix this critical security flaw and guarantee data integrity, we must add a robust layer of validation on the backend. In NestJS, the standard and most powerful way to achieve this is by using Data Transfer Objects (DTOs) combined with the ValidationPipe.   
This backend validation strategy allows you to:
- Automatically Validate the integrity and shape of incoming user input against defined rules (e.g., checking for required fields, minimum/maximum length, or valid email formats).
- Decouple Logic by cleanly separating validation rules from your controller and service business logic.
- Automatically Return Errors with a standard `400 Bad Request` response, preventing invalid data from ever touching our application's core logic.
    
#### Creating a NestJS DTO
A DTO acts as a schema for the incoming data, defining its expected properties and the rules that apply to them. 
First we  need to install the libraries that power the validation decorators.
```
npm install class-validator class-transformer
```
After that we create the class that validate and check our data and decorate its properties with validation rules.    
**`src/feedback/dto/feedback.dto.ts`**
```ts
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class FeedbackDto {
  @IsString() 
  @MinLength(2) 
  @MaxLength(100) 
  name: string;

  @IsEmail() 
  email: string;

  @IsString()
  @MinLength(10) 
  message: string;
}
```
We defined a `FeedbackDto` class used to validate user feedback, we used decorators from the `class-validator`. 
- the `name` field must be a string between 2 and 100 characters .
- the `email` field must be a valid email address. 
- the `message` field must be a string with at least 10 characters. 

These rules ensure that any incoming feedback data meets the required format before being processed.

to apply the DTO we add the following configuration to our ``main.ts``
```ts
// other import
import { ValidationPipe } from '@nestjs/common';

// ...
 app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
//....
```
### Updating the Controller Logic   
To activate this validation, we apply the built-in `ValidationPipe` to the route handler's request body.  
**`src/feedback/feedback.controller.ts`**
```TS
import {ValidationPipe, Controller, Get, Post,Res, Render, Body, Redirect,UseGuards } from '@nestjs/common';
import { FeedbackService, type Feedback } from './feedback.service';
import { FastifyCsrfGuard } from './fastify-csrf.guard';
import type{ FastifyReply} from 'fastify';
import { FeedbackDto } from './dto/feedback.dto';
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}
    
    @Get()
    @Render('feedback/form')
    async showFeedbackForm(@Res({ passthrough: true }) res: FastifyReply) {
        const csrfToken = await res.generateCsrf();
        return { csrfToken };
    }

    @Post()
    @UseGuards(FastifyCsrfGuard)
    @Redirect('feedback/feedbacks')
    handleFeedbackSubmission(@Body(ValidationPipe) body: FeedbackDto) {
        this.feedbackService.addFeedback(body);
    }

    @Get('feedbacks')
    @Render('feedback/feedbacks')
    showFeedbackList() {
        const feedback_list = this.feedbackService.getAllFeedback();
        return { feedback_list: feedback_list };
    }

}
```
We imported `FeedbackDto` and used it in the `@Post()` handler with `@Body(ValidationPipe) body: FeedbackDto`. This tells NestJS to automatically validate the incoming request using the rules defined in the `FeedbackDto` class.
- The `ValidationPipe` checks the request body against the validation rules inside `FeedbackDto`.
- Because we typed the parameter as `FeedbackDto`, NestJS knows to apply that specific DTO’s validation to this request.
- If the data fails validation, NestJS immediately returns a **400 Bad Request** with detailed error messages.
- The `handleFeedbackSubmission` method only runs if all fields are valid, ensuring that only clean and correct data reaches the service.
