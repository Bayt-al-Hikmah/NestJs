## Objectives
- Rendering and Returning Views
- Integrating a View Template Engine 
- Working With NestJs CLI
- Managing and Serving Static Files 
- Handling User Input with DTOs and Validation

## Rendering and Returning Templates 
In our previous workshop, we returned simple strings from our controllers (e.g., `return 'Hello World!';`). While this perfect for simple tests or APIs, most web applications need to display rich, structured content. To achieve this, we use HTML templates.  
A template is an HTML file where we can embed dynamic data before sending it to the user's browser. NestJS is platform-agnostic and allows us to plug in various template engines like Handlebars (HBS), EJS, or Pug.  
This approach keeps our application's logic (written in TypeScript) separate from its presentation (written in HTML/Handlebars), making our code cleaner and easier to maintain.
### Rendering Views with a Template Engine
To render and return an HTML template, we first need to install and configure a template engine adapter. We will use Handlebars with Fastify.
First, lets create new project called `workshop2` and install necessary packages:
```
nest new workshop2 
```
we chose npm as package manager , after that we navigate to the project directory and install our packages
```
cd workshop2
npm install @nestjs/platform-fastify @fastify/view handlebars
```
#### Setting Fastify Adapter
Next, we must configure our application in `main.ts` to use Fastify as Adapter, we do that as following

**``src/main.ts``**
```ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
```
Here we initializes our NestJS application using Fastify instead of the default Express server. NestFactory is used to create the application instance, and by passing the `FastifyAdapter`, the application runs on Fastify, which is known for its high performance and low overhead.
#### Setting The View Plugin
Now our NestJs project is set to Fastify Adaptater we can configure our template engine, we do that by registrig the `@fastify/view` plgugn with configuration of what template engine we want to use and the path where our templates are located
**`src/main.ts`**
```ts
import { join } from 'path';
import * as handlebars from 'handlebars';

  app.register(require('@fastify/view'), {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), 
  });

```
The Handlebars engine is provided in the configuration, enabling template rendering with `.hbs` files. The `templates` option specifies the directory where view templates are stored, We configured NestJS to look for templates in a folder named `views` at the root of our project (at the same level as `src`).
### Setting Up The Controller
Now Lets edit Our controller to serve the template we will make our app render ``index.hbs`` anytime the user visite the `/` route.

**`src/app.controller.ts`**
```ts
import { Controller, Get, Render } from '@nestjs/common';

@Controller() 
export class AppController {

    @Get()
    @Render('index')
    index() {
      return {};
    }
}
```
1. **`@Controller()`**: Makes all routes in this class start with `/`.
2. **`@Get()`**: Binds this method to handle `GET` requests for the controller's root.
3. **`@Render('index')`**: This is the key. It tells NestJS to find a template named `index` in our `views` folder, render it, and send it as the response.
4. **`return {};`**: This is the context, the data you want to pass to the template.

With this setup, when we visit `http://localhost:3000/`, NestJS will route the request to the `index` method, which renders and returns the `index.hbs` template.
### Creating The Template
Next, we’ll create our template. At the root of our project we create a folder named `views`. Inside that `views` folder, we create the file `index.hbs`.   

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
Once the server is running, open your browser and visit **`http://127.0.0.1:3000/`**. We should see the content of our `index.hbs` template displayed on the page.

## Handlebars Template Engine
With NestJS and the `@fastify/view` plugin we've configured, we can do much more than just render static HTML. The Handlebars engine allows us to build dynamic and reusable pages. Using this engine, we can insert variables, apply conditions, and loop through data, and even define reusable layouts and components.
### Passing Data to Views
We can display dynamic data inside our template by returning object from the controller  functions that use the `@Render` decorator.   

For example, let's update our `AppController` to pass username and age to our template  
**`src/app.controller.ts`**
```ts
import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class App1Controller {
  
  @Get()
  @Render('index')
  index() {
    return {
      username: 'Alice',
      age: 25
    };
  }
}
```
Here, we updated our `index` method to return an object which we call context object. The context object holds our dynamic data. The ``@Render()`` decorator makes it available inside the ``index.hbs`` template.       
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
The Handlebars engine also allows us to add conditions to our HTML templates using block helpers.     
We can use helpers like `{{#if}}`, `{{else if}}`, and `{{else}}` to control what content is displayed.  
#### Example
Let’s create new dynamic route inside our controller `/dashboard/:role`, depending on the role we load different content
**`src/app.controller.ts`**
```ts
import { Controller, Get, Param, Render } from '@nestjs/common'; // add Param to the import
  
  /*
    Our previous route
  */

  @Get('dashboard/:role') 
    @Render('dashboard')
    dashboard(@Param('role') role: string) {
    const context = {
      isAdmin: role === 'admin',
      isEditor: role === 'editor',
      isViewer: role === 'viewer',
    };
    return context;
  }

```
After that, let's create our template:  
**`views/dashboard.hbs`**
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
When a user visits `/dashboard/admin/` or `/dashboard/viewer/`, NestJS will render the appropriate message dynamically.
#### Notice
The basic Handlebars `{{#if}}` helper only checks for "falsy" values (like `false`, `null`, `undefined`, `0`, or an empty string). It cannot do direct comparisons like `==`. to handle this, the common practice is to pass booleans from the controller.
### Using Loops
Handlebars also allows us to loop through data in our templates. This is essential for displaying lists, tables, or collections of items.   
We use the `{{#each}}` block helper to iterate over data.
#### Example
Now, let’s create a new route `/items`, from this rote we will return list of items and display them in our template.  
**`src/app.controller.ts`**
```ts
  /*
    We add the following
  */
  @Get('items')
  @Render('items') 
  index() {
    const context = {
      fruits: ['Apple', 'Banana', 'Cherry', 'Mango', 'Orange']
    };
    return context;
  }
```
Now let’s create our template:
**`views/items.hbs`**
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
**`src/main.ts`**
```ts
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
  )

```
We add a configuration section for partials using the `options` property. Inside it, we define a `partials` object where we specify two things: the `navbar` and `footer` and we set as value to them the path.
Now, at the root of our project, we create a `views/partials` folder. In this folder, we’ll place our reusable components.  
**`views/partials/navbar.hbs`**
```html
<nav>
    <a href="/">Home</a> |
    <a href="/dashboard/viewer">Dashboard</a> |
    <a href="/items">Items</a>
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
**`src/main.ts`** 
```ts
  app.register(fastifyView, {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'),
    // --- NEW LAYOUT CONFIGURATION ---
    layout: 'layout', // Use 'views/layout.hbs' as the default layout
    options: {
      partials: {
        navbar: 'partials/navbar.hbs',
	    footer: 'partials/footer.hbs'
      },
    },
  });
```
The new `layout: 'layout'` line tells the view engine to look for a file named `layout.hbs` in the root `views` directory and wrap all rendered templates with it.
#### Create the `layout.hbs` File
Now, let's create this main layout. This file will now be the one that includes our partials.   
**`views/layout.hbs`**
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
The most important part is `{{{ body }}}`. This is the placeholder. The triple-stash `{{{` is crucial, it tells Handlebars to inject the HTML content without escaping it (unlike the double-stash `{{`), which is what we want for injecting our page's HTML.
#### Simplify Our Page Templates
Finally, we can clean up our `views/index.hbs` file completely. It no longer needs any boilerplate—just the unique content for that page.     
**`views/index.hbs`**
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

#### Notice
By setting the `layout: 'layout'` option in `main.ts`, that layout file will automatically wrap all templates rendered by our controllers.
## Working with NestJs CLI
As our application grows, if we keep putting all our logic and routes (like `/dashboard`, `/items`, `/users`, etc.) into the single `app.controller.ts` file, it will become massive, messy, and hard to maintain. This is often called **"spaghetti code."**  

NestJS is designed to prevent this by using Modules. The best practice is to create a new, self-contained feature module (like an `UsersModule`) for each major feature of our application. That module would then have its own dedicated controllers and services.  

### Creating Module
Let’s create items module and move our route logic into it.we generate a new module by using:
```shell
nest g module items
```
This command creates a new folder `src/items` and, inside it, a file named `items.module.ts`. It also automatically updates our root `app.module.ts` to import this new module.    
### Creating the Controller
After this  we need a controller  for the new module, we create it using:
```shell
nest g controller items --no-spec
```
This command does two things:
- It creates the file `src/items/items.controller.ts`.
- It automatically updates `items.module.ts` to declare this new controller.
- The `-no-spec` flag tell nestjs that we don't need tests file

Now, all logic for the `/items` route can be moved to `ItemsController`, keeping our main `AppController` clean and focused.  

``src/items/items.controller.ts``
```ts
import { Controller,Get,Render } from '@nestjs/common';
@Controller('items')
export class ItemsController {

  @Get('items')
  @Render('items')
  index() {
    const context = {
      fruits: ['Apple', 'Banana', 'Cherry', 'Mango', 'Orange']
    };
    return context;
  }
}
```
This means whenever a user visits `/items`, this controller will respond and render the `items` template.    
### Creating Service
We can also create service for our module by using:
```shell
nest g service items --no-spec
```
This will create `items.service.ts` file and edit the `items.module.ts` file to use the new service
### Creating Resource
Instead of creating the module, controller, and service separately, we can use a single command:
```
nest g resource app
``` 
This command will prompt you to choose the type of template you want for your feature (e.g., REST API or GraphQL) and whether you want basic CRUD operations to be generated. It will then create a new resource that includes:

- A module

- A controller

- A service

- An entity (for database integration)

- DTOs (for data validation)
## Managing and Serving Static Files
Real web applications need styles, images, and sometimes videos to enhance the user experience. These files, which don’t change dynamically, are called static files. NestJS provides a simple and efficient way to manage and serve these static files, such as CSS, JavaScript, and images.
### Setting Up Static Files
To serve static files we need to install the necessary packages:
```
npm install @fastify/static
```
### Configuring the Static Module
After installing the packages we configure static file serving in the **`main.ts`**, we install the `@fastify/static` Plugin
**`main.ts`**
```ts
  // We add this inside the boostrap function
  await app.register(require('@fastify/static'), {
    root: join(__dirname, '..', 'public'), 
    prefix: '/static/', 
    });
```
Here, we register the ``@fastify/static`` plugin and set the root of our static files folder to  ``public``. We also define the prefix as ``/static/``, which allows NestJS to serve static files directly from the server under this URL path (for example, /static/css/style.css).
### Creating the Styles File
Now let’s create a CSS file that will define the styles for our page. We’ll name it `style.css` and place it inside the `public/css/` folder.    
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
form {
    margin-top: 15px;  
}
button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 8px;
    font-size: 20px;
    cursor: pointer;
}
button:hover {
    background: #45a049;
}
form div label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}
input,textarea{
    width:350px;
}
input{
    font-size: 18px;
    padding: 10px;
}
textarea{
    height: 200px;
    font-size: 18px;
    padding: 10px;
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
	<link rel="stylesheet" href="/static/css/style.css">
    <link rel="icon" type="image/x-icon" href="/static/images/logo.png">
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
When the browser requests `/static/css/style.css`, NestJS automatically finds and serves the file at `public/css/style.css`. Similarly, it maps the request for `/static/images/logo.png` to the file at `public/images/logo.png`.
## Handling User Input with Forms
So far, our NestJS apps have focused on displaying data to users rendering templates, managing static files, and serving dynamic content. However, real-world web applications also need to receive data from users, process it, and often save it or use it to produce a result. The most common way to collect user input is through HTML forms. NestJS provides robust support for handling forms using Controllers to receive data and DTOs (Data Transfer Objects) with Pipes to validate it.
### Create a Feedback  Resource
Let’s create a new resource called `feedback` that allows users to submit their feedback and enables us to store and view these submissions.
```ts
nest g resource feedback
```
We chose REST API for the transport layer and we select Yes to generating CRUD entry points, this will create new folder with basic configration.
### Creating DTOs Validation
We need to create validation for data that will be sent by users, In NestJS, the standard and most powerful way to achieve this is by using Data Transfer Objects (DTOs) combined with the ValidationPipe.  

This backend validation strategy allows us to:
- Automatically Validate the integrity and shape of incoming user input against defined rules (e.g., checking for required fields, minimum/maximum length, or valid email formats).
- Decouple Logic by cleanly separating validation rules from our controller and service business logic.
- Automatically Return Errors with a standard `400 Bad Request` response, preventing invalid data from ever touching our application's core logic.
#### Creating a NestJS DTO
A DTO acts as a schema for the incoming data, defining its expected properties and the rules that apply to them.

First we  need to install the libraries that power the validation decorators.
```
npm install class-validator class-transformer
```
After that we edit the `create-feedback.dto.ts` we add validation and check our data and decorate its properties with validation rules.   

**`src/feedback/dto/create-feedback.dto.ts`**
```ts
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
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
We defined ther `CreateFeedbackDto` class to validate user feedback.
- the `name` field must be a string between 2 and 100 characters .
- the `email` field must be a valid email address.
- the `message` field must be a string with at least 10 characters.

These rules ensure that any incoming feedback data meets the required format before being processed.  
#### Editing the Configuration
To apply the DTO we add the following configuration to our ``main.ts``
```ts
// other import
import { ValidationPipe } from '@nestjs/common';

// ...

 app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));

```
### Creating The Service
A service's job is to handle business logic, our service will manage our data. For now, it will just keep an in-memory list, acting as our temporary "database."   
**`src/feedback/feedback.service.ts`**
```ts
import { Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  
  private readonly feedbacks: CreateFeedbackDto[] = []
  addFeedback(feedback: CreateFeedbackDto) {
    this.feedbacks.push(feedback);
   }

  getAllFeedback(): CreateFeedbackDto[] {
    return this.feedbacks;
  }  
}
```
We created the ``FeedbackService`` class and decorate it with ``@Injectable()``.  This tells NestJS that this class is a **service**, meaning it can be injected into other parts of the application so they can use its functionality.  

Inside the service, we created a  private list called `feedbacks` of type `CreateFeedbackDto`. we marked it `private readonly`, which means:
- Only this class can access it directly.
- The reference to the array cannot be reassigned but we can still push new feedback objects into it.

This list acts as our in-memory “database” for now.    
Finally, we create two public methods:

- ``addFeedback()`` take argument of type `CreateFeedbackDto`  which mean ir run validator on the data it recive, it it pass it use it to push new feedback item to the list else it will throw error 
- ``getAllFeedback()`` Returns all stored feedback so our controller can display it

### Creating The Controller
Finally, we need to create the controller. Its job is to handle incoming user requests, use the `FeedbackService` to store or retrieve data, and then return the correct template to the user.  

**`src/feedback/feedback.controller.ts`**
```ts
import { Controller, Get, Post, Render, Body, Redirect } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}
  
  @Get()
  @Render('feedback/form')
  showFeedbackForm() {
  }
  
  @Post()
  @Redirect('feedback/feedbacks')
  handleFeedbackSubmission(@Body() body: CreateFeedbackDto) {
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
We first used  ``@Controller('feedback')`` decorator to set the base URL for all routes in this file.  

After that we created `constructor` and inside it we use Dependency Injection by declaring `private readonly feedbackService: FeedbackService`. NestJS sees this, finds the `FeedbackService` (which we marked as `@Injectable()`), and automatically "injects" its instance for us to use.

Finally we defined three route handlers:  
**`showFeedbackForm`**: A `GET` request mapped to `/feedback`. The `@Render('feedback/form')` decorator tells NestJS to render our `form.hbs` template.   

**`handleFeedbackSubmission`**: This `POST` route is also mapped to `/feedback`.
- It uses the `@Body()` decorator to parse the form data from the request body and assign it to the `body` parameter and validate it against the `CreateFeedbackDto`.
- It then delegates the work by passing this data to `this.feedbackService.addFeedback()`.
- The `@Redirect('feedback/feedbacks')` decorator then automatically sends the user's browser to our feedback list page.


**`showFeedbackList`**: A `GET` route mapped to `/feedback/feedbacks`.
- It delegates by asking the service for all feedback using `getAllFeedback()`.
- It then passes the returned list to the `feedbacks.hbs` template by returning an object. NestJS injects `{ feedback_list: ... }` as context for the template.  

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
  // We register the plugin inside the boostrap function
  await app.register(require('@fastify/cookie'));
  await app.register(require('@fastify/csrf-protection'));
```
#### Creating Guard
A Guard in NestJS is a special type of class annotated with `@Injectable()` that implements the `CanActivate` interface. Guards have a single responsibility: to determine whether a given request should be handled by the route handler or not. This is often referred to as authorization.  
- Execution Order: Guards are executed after all global/per-route middleware but before any Interceptors or Pipes. They are the first line of defense before the business logic of our controller method.
- The Power of `canActivate()`: A Guard's core method is `canActivate()`. It receives the request context and must return a boolean (or a `Promise<boolean>` or `Observable<boolean>`).
    - If it returns `true`, the request proceeds.
    - If it returns `false` (or throws an exception like `ForbiddenException`), NestJS immediately denies the request and returns the appropriate HTTP status code.

Lets create Guard to handel the csrf protection.     
**`src/feedback/fastify-csrf.guard.ts`**
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
    const csrfProtection =  (fastifyInstance as any).csrfProtection;
    
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
Here we defined a custom CSRF guard, this guard checks if a valid CSRF token is present. It first gets access to the current HTTP request and response objects from the execution context.
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
Now we apply our `FastifyCsrfGuard` to the post route we do that by adding first importing the `UseGuards` then adding the `@UseGuards(FastifyCsrfGuard)` decorator after the `@Post()` decorator.  
**`src/feedback/feedback.controller.ts`**
```ts

import { Controller, Get, Post, Res,Render, Body, Redirect,UseGuards } from '@nestjs/common';

import { FastifyCsrfGuard } from './fastify-csrf.guard'; // we import the guard

  @Post()
  @UseGuards(FastifyCsrfGuard)
  @Redirect('feedback/feedbacks') // we use the guard here
  handleFeedbackSubmission(@Body() body: Feedback) {
    this.feedbackService.addFeedback(body);
  }
```

#### Adding Token To the Template
We also need to update the `feedback/form` route we add crsfToken and return it as context  the token is generated using `res.generateCsrf()`.
```ts
import { Controller, Get, Post, Render, Body, Redirect, UseGuards,Res  } from '@nestjs/common'; // add Res to the import
import type {  FastifyReply } from 'fastify'; // we import  FastifyReply as type

// we edit the feedback/form route

  @Get()
  @Render('feedback/form')
  async showFeedbackForm(@Res() res: FastifyReply) {
    const csrfToken = await (res as any).generateCsrf();
    return { csrfToken };
  }
```
### Updating th Dto
Now we sending token with our form data we need to update the validator to include the crsf token.   
**``src/feedback/dto/create-feedback.dto';``**
```ts
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateFeedbackDto {

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  message: string;

  @IsString()
  _csrf: string;
}
```
  
#### Update Template
We need to update our `form.hbs` template so it include the csrf token , we do that by adding a hidden input field to our form containing the token. The plugin automatically looks for a field named `_csrf`.    
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
