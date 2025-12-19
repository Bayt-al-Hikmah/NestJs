## Objectives
- Introduction to Backend Development
- Overview of the NestJs Framework
- Understanding NestJs ’s Project Structure and Philosophy
- Creating Our First NestJs Project
## What is Backend Development?
When we browse a website, book a flight, or use a mobile app, our interaction is with the front-end. We see the buttons, the text, and the images beautifully arranged on our screen. This is the visual part of the application, often called the client-side. But have you ever wondered what happens when you click that "Login" button or "Buy Now"?

![images](image.jpg)  


Behind the scenes, there's a whole other world working tirelessly to make that experience possible. This is the backend, also known as the server-side. It's the engine of the application, the part that you don't see but that does all the heavy lifting, It's responsible for everything the user doesn't directly interact with. These responsibilities include:

- **Storing and Managing Data:** When you create a user account, upload a photo, or write a blog post, the backend takes that information and securely saves it in a database. It also retrieves this data whenever it's needed.
- **Handling Business Logic:** The backend is the brain of the operation. It processes user requests, performs complex calculations, and enforces the rules of the application. For example, when you try to log in, it's the backend that checks if your username and password are correct. When you buy a product, it processes the payment and updates the inventory.
- **Communicating with the Front-End:** The backend has a constant conversation with the front-end. It receives requests from your browser (the client) and sends back the data needed to display the webpage or confirm an action.
- **Authentication and Security:** A critical role of the backend is to keep everything secure. It manages user logins, controls who has access to what information, and protects sensitive data from unauthorized access.

Essentially, if the front-end is the part of the restaurant where you sit, read the menu, and eat your meal, the backend is the entire kitchen. It's where the ingredients are stored, the chefs prepare the food, and everything is made ready to serve.
## Overview of the NestJs Framework
### What is a Framework?
Building a complex web backend from scratch is like crafting a car by forging every nut and bolt yourself it’s doable, but incredibly time-consuming and error-prone. Instead of reinventing the wheel, developers use a framework.  
A framework is a collection of pre-written code, tools, and conventions that provides a foundation for building software applications. Think of it as a toolkit and a blueprint rolled into one. It handles repetitive tasks like routing web requests, managing databases, and securing user sessions, freeing developers to focus on creating the unique features of their application.
### What is NestJS and How Does It Help Us?
NestJS is a progressive Node.js framework designed for building efficient, reliable, and scalable server-side applications. Born from the need to bring a structured, opinionated architecture to the Node.js (and TypeScript) ecosystem, NestJS was built to power complex, enterprise-level applications. Its primary goal is to simplify the repetitive, low-level tasks of backend development like handling HTTP requests, managing dependencies via dependency injection, and organizing code into modules so developers can focus on building their application’s unique business logic without starting from scratch.
### Opinionated and Modular
NestJS is often described with two key phrases:
- **"Opinionated":** NestJS has a clear philosophy about the “right way” to build applications, heavily inspired by Angular. It enforces a specific project structure (Modules, Controllers, Services) and powerful design patterns like **Dependency Injection**. While this might feel restrictive to some, it ensures consistent, maintainable, and highly scalable code. A developer familiar with NestJS can jump into any NestJS project and quickly understand its architecture, making collaboration and maintenance easier.

- **"Comprehensive & Modular":** NestJS provides a complete and extensible architecture. Its core framework and official packages provide nearly everything you need. It comes with first-class support for **TypeScript**, a powerful module system, and seamless integrations for tools like **TypeORM** or **Mongoose** (for database interactions), **class-validator** (for request validation), and **Passport** (for authentication). This eliminates the need to architect these integrations from scratch, saving time and ensuring consistency.
### Who Uses NestJS?
NestJS isn’t just for small projects it’s a powerful framework trusted by major organizations to handle high-traffic, complex, enterprise-grade applications. Some notable examples include:
- **Adidas:** Uses NestJS for parts of its backend infrastructure and e-commerce platform.
- **GoDaddy:** Leverages NestJS for building scalable backend services.
- **Fidelity Investments:** Employs NestJS within its financial services technology stack.
- **PicPay:** The major Brazilian financial technology company uses NestJS to power its payment services.
- **Novu:** The popular open-source notification infrastructure is built entirely on NestJS.

## NestJS's Project Structure and Philosophy
Now that we understand what NestJS is, let’s take a closer look at how NestJS organizes a project and the philosophy behind that structure.
### The MVC Pattern 
Before exploring NestJS's structure, it’s helpful to understand the MVC (Model-View-Controller) pattern. This pattern organizes an application into three interconnected components:
#### Model:
The model represents the data and the rules for managing it. It defines the structure of your database (e.g., using an ORM like TypeORM or a schema for Mongoose) and handles how data is stored, retrieved, and updated.
- Example: A `User` model might define fields like `username`, `email`, and `password`, along with logic for validating that data.
#### View:
In a traditional web application, the view is the user interface. In a modern backend framework like NestJS (which typically serves APIs), the "view" is the representation of the data sent to the client, most commonly as JSON.
- Example: A request for a user's profile would return a JSON object with their name and email, which a separate frontend application (like React or Angular) would then display.
#### Controller:
The controller acts as the glue. It processes user input (like incoming HTTP requests), interacts with the model to fetch or update data, and determines which "view" (JSON response) to return.
- Example: When a client sends a `POST` request to `/login`, the controller validates the credentials and returns a JSON Web Token (JWT) or an error message.
### NestJS's Architecture (Modules, Controllers, Services)
NestJS uses an architecture heavily inspired by Angular, which builds on MVC principles but strongly emphasizes Modularity and Dependency Injection. It organizes code into three main building blocks:
#### Controllers:
This is the "Controller" part of MVC. In NestJS, a controller is a class responsible for handling incoming requests and sending responses. It uses decorators to map specific request routes (e.g., `@Get('/users')`) and methods (e.g., `POST`, `PATCH`) to handler functions. Its job is to manage the HTTP communication and delegate complex logic.
- Example: A `UsersController` would define a method like `findAll()` decorated with `@Get()` to handle `GET /users` requests.
#### Services or Providers:
This is where the business logic lives . A service is a class responsible for tasks like data access, transformation, and validation. Services are "injected" into controllers using NestJS's Dependency Injection system, which keeps the controller clean and focused on routing.
- Example: A `UsersService` would contain the actual `findAll()` logic to query the database (using a **Model**) and return the list of users. The `UsersController` would simply call this service.
#### Modules:
This is the core organizational concept in NestJS. A module is a class annotated with `@Module()` that groups related components (like controllers and services) into a single, functional unit. This creates a clear boundary and helps manage complexity as the application grows.
- Example: A `UsersModule` would bundle the `UsersController` and `UsersService` together, making the "user" feature a self-contained part of the application.

In this architecture, NestJS's framework handles the "plumbing." It reads the modules to understand the application's structure, automatically wires up routes to controllers, and injects services where they are needed. This highly organized, decoupled approach makes NestJS applications exceptionally scalable, maintainable, and easy to test.
### NestJS's Project Structure
When we create a new NestJS project, it generates a specific set of files and folders, each with a clear purpose. This structure, combined with NestJS's philosophy of breaking projects into reusable Modules, makes it easy to manage complex applications and collaborate with other developers.
#### Creating a NestJS Project
To start a new NestJS project, we use the **Nest CLI** (Command Line Interface). We start by installing it using 
```shell
npm install -g @nestjs/cli
```
after that we can create a project by running:
```shell
nest new my-project
```
It will ask us to select which project manager we want to use , we select npm.  After that it will create a new folder named `my-project` with a complete boilerplate structure. While it creates many files, the most important ones live inside the `src` directory:
```
my-project/
├── node_modules/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── .eslintrc.js
├── package.json
├── README.md
└── tsconfig.json
```
Let’s break down the key files and their roles:
#### `src/` :
This is where all our application's **TypeScript** code lives.
#### `main.ts`:
This is the **entry point** of our application. It contains the bootstrap function that creates the Nest application instance and starts our web server. We can think of it as the "ignition key" that starts the whole engine. We also configure app-wide things here, like validation pipes or security (CORS).
#### `app.module.ts`:
The **root module** of the application. It's the heart of our project's dependency graph. This file is where we register our main controllers, services, and most importantly import other "feature modules" (like a `UsersModule` or `OrdersModule`). 
#### `app.controller.ts`:
A basic controller to get us started. This file is responsible for handling incoming HTTP requests and returning responses. It uses decorators like `@Get()` to map URL routes (e.g., `/`) to specific methods, acting as the "traffic controller" for your API.
#### `app.service.ts`:
A basic service with a single "hello world" method. Services are where our business logic lives. Controllers should delegate tasks (like fetching data from a database or running calculations) to services to keep the code clean and testable.
#### `package.json`:
A standard Node.js file that acts as our project's control panel. It lists all our project's dependencies (like NestJS, TypeORM, etc.) and defines useful command-line scripts, such as `npm run start:dev` (to run the development server) or `npm run build` (to compile our TypeScript).  
This structure keeps your application's logic (services), routing (controllers), and configuration (modules) neatly separated, making it easy to manage and scale.
### NestJS’s Modules
NestJS encourages breaking a project into smaller, reusable components called modules. A module is a self-contained component that handles a specific piece of functionality, like a blog, a user authentication system, or an e-commerce store. Each module can have its own controllers, services, and data models, making it portable and reusable across projects.   
For example, a website might have one module for a blog, another for user profiles, and a third for a payments. This modular approach makes our codebase easier to maintain, test, and scale.  
To create a new module (often as part of a "resource"), we use the Nest CLI. We navigate to the project’s root directory and run:
```shell
nest generate resource users
```
This command creates a new folder named `src/users` (you can choose any name) with a complete set of files for that feature:
```
src/
└── users/
    ├── dto/
    │   ├── create-user.dto.ts
    │   └── update-user.dto.ts
    ├── entities/
    │   └── user.entity.ts
    ├── users.controller.ts
    ├── users.module.ts
    ├── users.service.ts
    └── users.service.spec.ts
```
#### `users.module.ts`
Defines the module's configuration. It declares which controllers and providers (like services) belong to this module. This is the file we import into the root `app.module.ts` to "install" the feature.
#### `users.controller.ts`
Contains the logic for handling HTTP requests and defining routes for this module (e.g., `POST /users`, `GET /users/:id`). It's responsible for receiving requests and returning responses, similar to Django's `views.py`.
#### `users.service.ts`
Contains the core business logic for the `users` feature. The controller calls methods in this service to fetch or modify data (e.g., `findAll()`, `create(userDto)`). This keeps our controller clean and focused on handling HTTP traffic.
#### `entities/user.entity.ts`
Defines the data structure for our module using a TypeScript class, often decorated for an ORM (like TypeORM or Prisma). This class represents a database table, and its properties represent fields, making it the direct equivalent of a Django `models.py` file. **Example:** A `User` entity might define `id`, `username`, and `password`.
#### `dto/` (Data Transfer Objects)
This folder holds classes that define the _shape_ of data for requests. For example, `create-user.dto.ts` would define that the `POST /users` endpoint expects a `username` (string) and `password` (string), which NestJS can automatically validate.
#### `*.spec.ts`
Contains test cases for our module. NestJS generates test files for controllers and services by default, encouraging automated testing to ensure our code works as expected (like Django's `tests.py`).  
After creating a resource, the Nest CLI **automatically registers it** in our project’s `app.module.ts` file by adding `UsersModule` to the `imports` array. This tells Nest to include the module in our project.

#### Why This Structure is Useful
NestJS’s project and module structure promotes modularity and reusability. By separating configuration (project-level files) from functionality (modules), we can keep our codebase organized and focused. Modules allow us to break complex applications into manageable pieces, making it easier to:
- **Maintain**: Each module focuses on one feature, so you can update or debug it without affecting the rest of the project.
- **Reuse**: Modules are portable, so you can use the same module (e.g., a "blog" module) in multiple projects with minimal changes.
- **Collaborate**: The consistent structure means other NestJS developers can quickly understand and contribute to your project.
- **Scale**: As your project grows, you can add new modules without cluttering the codebase, keeping it clean and manageable.

NestJS’s opinionated structure ensures that developers follow best practices like Dependency Injection and Separation of Concerns, reducing errors and making it easier to build robust, secure, and highly testable applications. Whether we’re building a small REST API or a complex, high-traffic microservice, this structure provides the flexibility and organization needed to succeed.
## Creating Our First Project
Now that we understand the structure of a NestJS project, let’s build our first application. This section will guide you through setting up your development environment and installing the NestJS CLI.
### Configuring the Development Environment
NestJS runs on Node.js. The Node.js ecosystem isolates project dependencies by default. Each project has its own `node_modules` folder, managed by a `package.json` file. This acts as an isolated space for our project's packages, ensuring they don’t conflict with other projects.  
#### Install Node.js
Before we begin, we need to install nodejs on our system. We will download it from the official [Node.js website](https://nodejs.org/).
#### Install the NestJS CLI
The primary tool for creating and managing NestJS projects is the Nest CLI (Command Line Interface). We install this globally on our system using `npm`:
```shell
npm install -g @nestjs/cli
```
This installs the `nest` command, making it available from any directory in our terminal. To verify the installation, we can check the installed version:
```
nest --version
```
This should display the installed NestJS CLI version.
### Building Our Application
Now that we’ve set up our environment and installed the Nest CLI, it’s time to start building our first app a simple "Hello World" application to get familiar with how NestJS works.
#### Creating the NestJS Project
To start, we’ll create a new NestJS project using the `nest` command. Run the following command in your terminal or command prompt:
```shell
nest new hello-world
```
This command will ask us what project manager we want to chose, we can select npm, after this it does several things:
- Creates a new directory named `hello-world`.
- Generates the initial project structure with all the necessary boilerplate files.
- Installs all the required Node.js dependencies into a `node_modules` folder.

Navigate into the project directory:
```shell
cd hello-world
```
#### Understanding the Default App
In NestJS, a new project already includes a default "Hello World" app, which is handled by the root module.  
Let's look at the files that handle this "Hello World" functionality.
#### Configuring Routes (The Controller)
To make our NestJS app accessible, we need to set up URL routing. In NestJS, this is handled by Controllers.  
A Controller is responsible for receiving incoming requests and returning responses. 

Let’s look at the default controller file:  
**`src/app.controller.ts`**
```ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```
Let's break this down:
- We import decorators like `@Controller` and `@Get` from NestJS. Decorators are used to add metadata and behavior to classes and methods.
- `@Controller()`: This decorator marks the class as a Controller. Since it's empty, it handles the root path of the application (e.g., `/`). If we used `@Controller('hello')`, it would handle all routes starting with `/hello`.
- `@Get()`: This decorator marks the `getHello()` method as a handler for HTTP GET requests.
- When a user visits the root URL (`/`) with a GET request, NestJS calls the `getHello()` method.
- This method then calls `this.appService.getHello()` to get the actual data to return.
#### Creating the App’s Logic (The Service)
Now let’s add the actual functionality. NestJS strongly encourages separating business logic from our controllers. This logic lives inside Services.  
Open the `src/app.service.ts` file:
```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello, World!';
  }
}
```
- `@Injectable()`: This decorator marks the class as a **Provider** that can be managed by the NestJS runtime.
- We define a function named `getHello()` that takes no parameters.
- Inside the function, we simply `return "Hello, World!"`. This tells Nest to send back a basic text response with that message.
- The `AppController` injects this `AppService` and calls this method, creating a clear separation of concerns.
#### Registering the App Components 
Before NestJS can use our `AppController` and `AppService`, we need to register them with the project. This step lets Nest know that these components exist and should be managed.  
In NestJS, we do this inside a Module file.
Open the `src/app.module.ts` file and locate the `@Module` decorator:
```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController], 
  providers: [AppService],    
})
export class AppModule {}
```
By adding `AppController` to the `controllers` array and `AppService` to the `providers` array, we’re telling NestJS to load these components and make them available for the application.   
#### Running the Development Server
Now that our app is ready, it’s time to test everything by running Nest's built-in development server.  
From the `hello-world` project directory (where `package.json` is located), open your terminal and run the following command:  
```
npm run start:dev
```
This command starts Nest's lightweight development server, which runs by default on **`http://localhost:3000`**. It also "watches" your files, so any time you save a change, the server will automatically recompile and restart.  
Open your web browser and visit **`http://localhost:3000`**. You should see the message **“Hello, World!”** displayed on the page. This confirms that your app is correctly configured NestJS routed the request through the `AppController`, which called the `AppService` to generate the response.
### Working with Dynamic Routes and Parameters
We’ve successfully built a simple NestJS app that displays “Hello, World!” when someone visits the `http://localhost:3000` URL. But right now, our app behaves the same way for everyone no matter who visits, they get the same message. Let’s make our app a bit more dynamic and interactive by customizing responses based on URL parameters.
#### Dynamic Routes 
Anyone visiting `http://localhost:3000` gets the same greeting. Let’s improve that so the app can greet users by name, for example, visiting `http://localhost:3000/Alice` would show “Hello, Alice!” and `http://localhost:3000/Bob` would show “Hello, Bob!”.  

To do this, we’ll use dynamic route patterns in NestJS. Dynamic routes include route parameters, which act as placeholders in the URL that capture part of the path and pass it to the controller method as a variable.
Let’s update our controller file: `hello-world/src/app.controller.ts`
```ts
import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() 
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':name')
  personalGreeting(@Param('name') name: string): string {
    return `Hello, ${name}!`;
  }
}
```
Here's the breakdown of our new route:
- `@Get(':name')`: This decorator creates a new route handler. The `:name` part is a **route parameter**. It tells Nest to match any text at this position (e.g., "Alice", "Bob") and capture it.
- `personalGreeting(@Param('name') name: string)`: We've added a `name` parameter to our method.
- The `@Param('name')` decorator is the key: it injects the value captured from the `:name` URL segment directly into our `name` variable.

When a user visits `http://localhost:3000/Alice`, NestJS looks at the URL, recognizes the part after `/` as the `name` value (“Alice”), and passes it to the `personalGreeting` function. The function then returns the dynamic string, resulting in the message **“Hello, Alice!”**.
#### Query Parameters
Let’s improve this even more and give users control over the greeting message itself. For example, visiting:

```
http://localhost:3000/Alice?greet=Welcome
```
should display:
```
Welcome, Alice!
```
These are called query parameters, and they come after a `?` in the URL. Unlike route parameters (which are part of the URL pattern), query parameters are optional and handled inside the controller method using the `@Query()` decorator.  
Let’s modify our `personalGreeting` method to use them:  
**`hello-world/src/app.controller.ts`**
```ts
import { Controller, Get, Param, Query, DefaultValuePipe } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() 
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':name') 
  personalGreeting( @Param('name') name: string, @Query('greet', new DefaultValuePipe('Hello')) greeting: string,
  ): string {
    return `${greeting}, ${name}!`;
  }
}
```
Here’s how it works:
- We added a new parameter, `greeting`, to our method, decorated with `@Query('greet', ...)`. This tells Nest to look for a query parameter named `greet`.
- `new DefaultValuePipe('Hello')`: This is a **Pipe**. Pipes are a powerful NestJS feature that can transform or validate incoming data. This specific pipe provides a default value. If the user doesn't provide a `greet` query parameter, the `greeting` variable will automatically be set to "Hello".
- NestJS then builds the response dynamically based on the user input.

Now let’s see it in action (assuming your server is running on port 3000):
- Visit `http://localhost:3000/Alice` → **Hello, Alice!**
- Visit `http://localhost:3000/Alice?greet=Welcome` → **Welcome, Alice!**
- Visit `http://localhost:3000/Bob?greet=Good%20Morning` → **Good Morning, Bob!**