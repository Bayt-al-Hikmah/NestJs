## Objectives
- Working with Database and Django Models  
- Authentication and Session Management  
- Working with NestJs CLI
- Managing the Admin Panel
## Databases, TypeScript, and NestJS ORMs
In our previous sessions, we built applications that displayed dynamic content. For example, in our `feedback` app, we accepted user input and stored it in a simple TypeScript array. However, that data structure exists only in the server's RAM (memory), meaning it’s temporary.    
This approach has a serious limitation: data stored in memory is volatile. As soon as the NestJS server restarts, shuts down, or crashes whether due to maintenance, updates, or deployment all the information in that array is instantly lost.   
To build real, reliable backend services, we need a way to store data permanently, so it remains available even after the server restarts. This is where databases come in.
### Database
A database is a specialized, structured system for storing, managing, and retrieving information efficiently. Instead of vanishing when the server stops, a database saves our data permanently on disk, ensuring it's still there the next time our application starts.   
Databases are essential because they:  
- **Store data persistently** (it doesn't disappear when the app restarts).
- **Organize data** in a structured, reliable format.  
- Allow us to **query and filter** data efficiently (e.g., "find all active users in the system").
- **Maintain data integrity and security**, even when many users are reading and writing data at the same time.
    

### Types of Databases
Databases aren't one-size-fits-all. They come in different types, depending on how they organize and manage data. The two main categories you'll encounter are:
#### Relational Databases (SQL)
These are a very common type of database. They store data in tables made up of rows and columns, much like organized spreadsheets that can be linked together. Relational databases use a specialized language called SQL (Structured Query Language) to create, read, update, and delete data.   

They’re ideal for applications where data relationships and structure are important.   

**Examples:** PostgreSQL, MySQL, SQLite, Microsoft SQL Server.
#### Non-Relational Databases (NoSQL)
These databases are more flexible and store data in various formats such as documents , key-value pairs, wide-column stores, or graphs.    

They’re often used for large-scale systems, unstructured data, or applications that need to handle rapidly changing information.    

**Examples:** MongoDB, Redis, Cassandra.

**NestJS** is **database-agnostic**, meaning it works well with either relational or non-relational databases. Your choice depends entirely on your application's needs.

### Relational Databases Structure
A relational database stores data in tables, similar to how a spreadsheet organizes information, each table represents a specific entity type for example, a `Customers` table or an `Orders` table, each row in a table represents a single record a specific customer, order, or product, each **column** defines a property or field, describing what kind of information is stored such as `name`, `email`, `order_date`, or `total_amount`.
#### Primary Keys
To keep data organized and ensure each record is unique, every table includes a primary key. A primary key is a special column (or combination of columns) that uniquely identifies each record in a table.
- It prevents duplicate entries.
- It allows the database to quickly find, update, or delete specific rows.


In most cases, the primary key is an automatically generated integer called `id`.

**Example: Customers Table**

|**id (Primary Key)**|**name**|**email**|
|---|---|---|
|1|Alice Smith|alice@example.com|
|2|Bob Johnson|bob@example.com|

Here:
- Each row represents one unique customer.
- Each column stores a property of that customer.
- The `id` column serves as the **primary key**, guaranteeing that no two customers share the same identifier.

The database enforces data integrity by applying rules such as data types (text, numbers, dates) and constraints (e.g., required fields or unique values).
#### Foreign Keys and Relationships
Relational databases are powerful because they can define relationships between tables, linking related data without duplicating it. This is done through foreign keys.

A foreign key is a column in one table that refers to the primary key of another table. This creates a connection between records and ensures consistency.

### Common Types of Relationships

#### One-to-One
Each record in Table A is linked to exactly one record in Table B, and vice versa.

Example: A Users table and a UserProfiles table, linked by a foreign key referencing the user’s id.
#### One-to-Many
A single record in one table can be linked to multiple records in another. This is the most common type of relationship.

Example: Orders Table

| **id (Primary Key)** | **order_date** | **total_amount** | **customer_id (Foreign Key)** |
| -------------------- | -------------- | ---------------- | ----------------------------- |
| 101                  | 2025-10-25     | 45.99            | 1                             |
| 102                  | 2025-10-26     | 29.50            | 1                             |
| 103                  | 2025-10-27     | 100.00           | 2                             |

- The `customer_id` column is a foreign key referencing the `id` in the `Customers` table.    
- This forms a one-to-many relationship: Customer 1 has two orders.
#### Many-to-Many
Multiple records in Table A can be linked to multiple records in Table B. This is managed using a third table, a junction or association table, to store the connections.

Example: One post can have multiple tags, and one tag can be applied to multiple posts.

| post_id (FK) | tag_id (FK) |
| ------------ | ----------- |
| 10           | 3           |
| 10           | 5           |
| 12           | 3           |
This structure keeps the data organized and avoids duplication while preserving relationships.
### Connecting NestJS to Databases
Now that we understand what databases are, let's discuss how our NestJS application can communicate with one.   
In Node.js TypeScript, we could directly use low-level database drivers and write SQL queries or MongoDB commands inside our code.
For example, using a SQL driver directly:
```ts
// Example using a simple driver like 'pg' for PostgreSQL
import { Client } from 'pg';

const client = new Client({ /* config */ });

async function insertUser(name: string) {
  await client.connect();
  // We're mixing raw SQL queries with our TypeScript logic
  await client.query("INSERT INTO users (name) VALUES ($1)", [name]);
  await client.end();
}
```
This works, but it has a big drawback: we’re mixing raw database queries directly with TypeScript logic in our Services. This makes our code harder to maintain, debug, and scale. If we decide to switch databases (e.g., from PostgreSQL to MySQL), we’ll need to rewrite every single query because SQL syntax and data types can vary.   

This approach doesn’t align with the NestJS philosophy of keeping code clean, modular, and reusable. Luckily, NestJS strongly supports the use of Object-Relational Mappers (ORMs) and Object-Document Mappers (ODMs).

### Understanding ORMs/ODMs and Their Benefits
An ORM (for SQL) or ODM (for NoSQL) is a layer of abstraction that bridges the gap between our application's TypeScript/OOP models and the database's structure. It automatically translates our object-oriented operations into database-specific queries, such as SQL or MongoDB commands, without us writing them directly.   
In the NestJS ecosystem, popular choices are: TypeORM (for SQL), Prisma (a next-gen ORM/client), and Mongoose (for MongoDB).

Here are the key roles and benefits of using an ORM/ODM:
#### Abstraction and Portability:
We define our data structure using TypeScript Classes (called Entities in TypeORM, or Schemas in Mongoose), and the ORM/ODM generates the appropriate database commands. If we switch databases, we often only need to change a configuration setting, not rewrite all our data access logic.
#### Improved Productivity and Type Safety:
Instead of juggling raw query strings, we work entirely in TypeScript. This allows us to use familiar object methods (e.g., `userRepository.save(newUser)`) and gain powerful type safety the compiler can check that we are using the correct fields and relationships.
#### Data Integrity and Security:
The ORM/ODM enforces data integrity, manages schema migrations (e.g., with TypeORM or Prisma Migrate), and automatically sanitizes inputs, protecting your app from SQL injection and ensuring consistent data.
#### Modularization with Repositories and Services:
In NestJS, ORMs/ODMs are typically injected into Providers (Services), allowing for a clean separation of concerns. The Service handles business logic, and the injected Repository/Client handles the database interaction.

In short, using an ORM/ODM with NestJS and TypeScript lets us focus on our application’s business logic and maintain strong type-checking, making development faster, safer, and far more enjoyable.
cd

### Working with NestJS Entities
In NestJS, we use TypeORM to interact with the database.  Lets explore how that work by creating todo app user can add add and save task in the database.    
We need first to create a new NestJS project named **`workshop3`** 
```shell
nest new workshop3
cd workshop3
```
After that we generate the `todo` resource using the following commands:
```shell
nest generate resource todo
```
It will propmet us to select the project type we go for Rest Api and it will ask if we want to create the CRUD operation we select yess, with this  it will generates a new module, a controller to handle API routes, and a service to manage business logic and database access.
- `src/todo/todo.module.ts` (The module definition)
- `src/todo/todo.controller.ts` (Handles incoming HTTP requests—our **Views/URLs** equivalent)
- `src/todo/todo.service.ts` (Handles business logic and database interaction)
- ...and stub files for DTOs and testing.
#### Defining The Todo Entity
Now, we'll define the structure of our tasks table by creating our Entity,before doing that we need instal the TypeORM packge
```
npm install @nestjs/typeorm typeorm sqlite3
```
After we installed the backage we define the schema of our database table inside the **`src/todo/entities/todo.entity.ts`** file.    

**`src/todo/entities/todo.entity.ts`:**
```ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column({ default: false })
  done: boolean; // Field to track completion status

  @CreateDateColumn()
  created_at: Date;
}
```
Here we started by importing **decorators** from the `typeorm` package. We then used the `@Entity()` Decorator to mark the `Todo` class, which tells TypeORM to automatically map this class to a corresponding table in our database.
The class has the following properties, which define the columns of that table:
- **`id`**: Its type is `number` and it uses the `@PrimaryGeneratedColumn()` decorator. This is a crucial TypeORM decorator that automatically sets this property as the table's primary key and ensures its value is auto-generated (usually auto-incremented) by the database.
- **`title`**: Its type is `string`. It uses `@Column({ length: 200 })` which means it represents a standard text column in the table and has a constraint limiting the value to a maximum of 200 characters.   
- **`description`**: Its type is `string`. It uses `@Column('text')`, which tells the database to use a longer text data type, similar to a `TEXT` or `CLOB` field, suitable for detailed descriptions.
- **`done`**: Its type is `boolean`. It uses `@Column({ default: false })`. This property tracks the completion status of the task, and the `default: false` option ensures that any new task created will automatically be marked as not done.
- **`created_at`**: Its type is `Date`. It uses the `@CreateDateColumn()` decorator. This is a special decorator that automatically populates the field with the **timestamp** of when the row was first inserted into the database, handling our need for automatic time recording.

After creating an Entity, we need to ensure the database layer knows about it. In NestJS/TypeORM, we typically do this by importing the Entity into the module's TypeORM configuration.

**`src/todo/todo.module.ts`**
```ts
// src/todo/todo.module.ts
import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { Todo } from './entities/todo.entity'; // Import the Entity

@Module({
  imports: [TypeOrmModule.forFeature([Todo])], // Register the Todo Entity
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
```
Here we add another import to the **`TodoModule`** and we use **`TypeOrmModule.forFeature([Todo])`**, this will make the `Todo` database entity available for use by the **`TodoService`** and is necessary for NestJS to manage the corresponding database table and allow us to perform CRUD operations on it.   
**Notice**
If you are using a development database setup with TypeORM synchronization enabled (e.g., `synchronize: true` in your main `AppModule`), TypeORM will automatically create the corresponding `todo` table and columns when the application starts. For production, you would use **migrations** instead.
#### Configuring the app.module
```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({

  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,

    }),
    TodoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
```
The `TypeOrmModule.forRoot()` method configures the database connection. Here, we are using SQLite as the database by setting `type: 'sqlite'`, and specifying the database file name under the `database` property. We also provide the list of entity files so TypeORM knows which models to map to database tables. The `synchronize: true` option automatically updates the database schema to match your entity definitions (such as those in `todo.entity.ts`) every time the application starts. This is useful during development, but it should be set to `false` in production to avoid unintentional data loss or schema changes.
#### Creating the DTOs 
Lets create the DTOs to define the expected structure and validation for data coming in from the client (e.g., from an HTML form or a JSON API request).   
We first install the package
```shell
npm install class-validator class-transformer
```
**`src/todo/dto/create-todo.dto.ts`:**
```ts
// src/todo/dto/create-todo.dto.ts
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
By using decorators like **`@IsNotEmpty()`** and **`@MaxLength()`** from the `class-validator` package (a NestJS best practice), we get automatic validation built into our application pipeline. This means the controller won't even execute if the incoming data doesn't meet these requirements.
#### Creating the Service
Noe lets create the **`TodoService`**  which is responsible for communication with the database.
**`src/todo/todo.service.ts`**, 
```ts
// src/todo/todo.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo) // Inject the Todo repository
    private todoRepository: Repository<Todo>,
  ) {}

  // Equivalent to Todo.objects.all()
  findAll(): Promise<Todo[]> {
    return this.todoRepository.find();
  }

  // Equivalent to form.save()
  create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const newTodo = this.todoRepository.create(createTodoDto);
    return this.todoRepository.save(newTodo);
  }
}
```
Same as we did for the feedback app here the we created the  **`TodoService`** to handel the logic layer for the `Todo` module. It constructor manage data access to our database by injecting the TypeORM **`Repository<Todo>`** using the `@InjectRepository(Todo)` decorator.    
The service exposes two main methods: 
- `findAll()`, which uses `this.todoRepository.find()` to query and return all tasks from the database; and 
- `create()`, which first uses `this.todoRepository.create()` to map the incoming `CreateTodoDto` data into a valid `Todo` entity instance, and then uses `this.todoRepository.save()` to persist the new task to the database. This pattern keeps the database logic neatly centralized.
#### Creating The Template
We first install and set the template engine
```
npm install @nestjs/platform-fastify @fastify/view handlebars
```
Configuring the ``main.ts`` file
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
Now we create our templates, we need two templates.
**``views/todo/tasks.hbs``**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My To-Do List</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <div class="container">
        <h1>My To-Do List</h1>
        <a href="/todo/add" class="btn">Add New Task</a>
        <ul class="task-list">
            {{#if tasks}}
                {{#each tasks}}
                    <li class="{{#if done}}done{{/if}}">
                        <strong>{{ title }}</strong><br>
                        <small>{{ description }}</small>
                    </li>
                {{/each}}
            {{else}}
                <li>No tasks added yet. Start by creating one!</li>
            {{/if}}
        </ul>
    </div>
</body>
</html>
```
This template will receive the `tasks` array from the controller and loop through it to display the todo items.
**``views/todo/add_task.hbs``**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Add New Task</title>
    <link rel="stylesheet" href="/css/style.css">
</head>

<body>
    <div class="container">
        <h1>Add a New Task</h1>
        <form method="POST" action="/todo/add">
            <div>
                <label for="title">Title</label>
                <input type="text" id="title" name="title" required>
            </div>
            <div>
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="5" required></textarea>
            </div>
            <button type="submit">Save Task</button>
        </form>
        <a href="/todo" class="btn back">Back to List</a>
    </div>
</body>
</html>
```
This template includes the form that posts the data to the controller.
#### Adding Style
We will use the style that exist in the material folder, we first need to configure our app to load static files,
```shell
npm install @nestjs/serve-static @fastify/static
```
Then we configure our main module file to load the style from folder named public
```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({

  imports: [
  TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
   ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    
  TodoModule],
  controllers: [AppController],
  providers: [AppService],

})

export class AppModule {}
```
#### The Controller 
Finally we edit our controller, we will need three route, one for displaying form so user can add a todo task, one to handel the form submitted data and the last route to display user todo tasks
```ts
import { Controller, Get, Post, Body, Render, Res, HttpStatus } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './entities/todo.entity';
import { Response } from 'express'; // Import Response type from express


@Controller('todo') 
export class TodoController {
    constructor(private readonly todoService: TodoService) {}

    @Get()
    @Render('todo/tasks.hbs') 
    async taskList() {
        const tasks = await this.todoService.findAll();
        return { tasks };

    }

    @Get('add')
    @Render('todo/add_task.hbs')
    addTaskForm() {
        return {};
    }

    @Post('add')
    @Redirect('/todo')
    async addTask(@Body() createTodoDto: CreateTodoDto, @Res({ passthrough: true }) res: FastifyReply) {
        try {
            await this.todoService.create(createTodoDto);

        } catch (error) {
            console.error("Failed to create todo:", error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Error saving task.");
        }
    }
}
```
The controller defines routes under `/todo` and uses `TodoService` to interact with task data.   
* The `@Get()` route fetches and displays all tasks by rendering the `tasks.hbs` view.   
- The `@Get('add')` route renders a form to create a new task. 
- The `@Post('add')` route handles form submission by receiving task data (`CreateTodoDto`), calling the service to save it, and then redirecting back to the task list. If an error occurs while saving, it returns an internal server error response. 
#### Running The App
We run our app with `npm run start:dev` the routes will be available at:
- **`GET http://localhost:3000/todo`**: To retrieve the list of tasks (equivalent to visiting the list view).
- **`POST http://localhost:3000/todo`**: To submit a new task (equivalent to submitting the form).

## Authentication and Session Management in NestJS
Authentication is the process of verifying the identity of a user, device, or system before granting access to resources or data. In the context of web applications, it ensures that only authorized individuals can interact with certain parts of the app, such as viewing personal information, making changes, or performing actions.  
Without authentication, anyone could access or modify data, leading to security risks like unauthorized edits, data breaches, or misuse. Authentication typically involves credentials like usernames and passwords, but it can also include more advanced methods such as two-factor authentication (2FA), biometrics, or token-based systems.
### Token-Based Authentication (JWT)
A JWT is a compact, secure way to transmit information between parties as a JSON object.   
- Stateless: After a user logs in, the server generates a token (the JWT) and sends it back to the client (browser or mobile app). The client stores this token and includes it in the Authorization header of every subsequent request. The server doesn't need to store session data in its memory or database, making it highly scalable.
    
- **Authentication Flow:**
    1. User sends credentials (username/password) to the server's login endpoint.
    2. Server validates the credentials, generates a JWT, and returns it.
    3. Client attaches the JWT to future requests.
    4. NestJS middleware (Guard) extracts the token, verifies its signature (to ensure it hasn't been tampered with), and authenticates the user for that request.
### NestJS Ecosystem for Auth
NestJS uses several core concepts and modules to implement secure, modular authentication:
- **`@nestjs/passport`:** A NestJS wrapper around the popular Node.js authentication middleware, Passport.js.
- **`@nestjs/jwt`:** Module for creating and verifying JSON Web Tokens.
- **Guards:** Special classes that determine if a user has permission to access a route, acting as the authentication wall for your controllers.
- **Strategies:** Passport mechanisms (e.g., `LocalStrategy` for username/password, `JwtStrategy` for token verification) to handle specific authentication methods.
### Implementing JWT Authentication
We will create an `AuthModule` to handle registration, login, and token generation.
#### Install Packages
We need packages for Passport, JWTs, password hashing, and TypeORM for the `User` entity.
```ts
npm install @fastify/cookie @nestjs/passport passport passport-local @nestjs/jwt argon2 passport-jwt
npm install @types/passport-local @types/passport-jwt 
```
Setting our ``main.ts`` file
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
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
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
```
We register the cookies plugin for our app
#### Creating the Module
After that, we generate a new resource for the authentication module.
```
nest g resource auth
```
Now we start building our module logic
#### Creating Entity
We must define a `User` entity that will store user credentials.
**`src/auth/entities/auth.entity.ts`**
```ts
import { Entity,OneToMany, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Todo } from '../../todo/entities/todo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];
}
```
The User have password and username and also id field automaticly generated ,we can see we set the username unique, We also crete OneToMany relationship between our user and todo items a user can have many tasks. and task can have link back to only 1 user
#### Creating The DTO
We create the DTO to validate user input   
**``src/auth/dto/create-auth.dto.ts``**
```ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class AuthDto  {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```
#### Configure `AuthModule` 
We need  now to set up the `AuthModule` with the necessary imports for TypeORM and JWT configuration.
Add the `JwtModule` to `AuthModule` with a secret key (a strong, complex string) and token expiration.

**`src/auth/auth.module.ts`**
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/auth.entity';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';  


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: 'YOUR_VERY_SECRET_KEY_HERE',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})

export class AuthModule {}
```
We begin by registering the `User` entity with TypeORM so our application can store and read user data from the database.  
Next, we import the `PassportModule`. Passport is a lightweight authentication library that NestJS uses to handle login strategies. Instead of building login logic manually, Passport gives us a clean structure for verifying users.    
We use two strategies here:
- **LocalStrategy** checks the email/username and password when the user tries to log in.
- **JwtStrategy**  validates the JWT token sent with requests after login.

The `JwtModule` is configured with a secret key to sign tokens and an expiration time so tokens don’t last forever. When a user logs in successfully, the server creates a token for them using this module.

The `AuthController` receives HTTP requests like login and signup. It forwards the work to the `AuthService`, which handles validating users and generating JWT tokens.

We export the `AuthService` so other modules (like the Todo module) can use it later to identify the currently logged-in user.

#### Implement `AuthService`
The service handles database interaction (saving/finding users) and password hashing/comparison using `argon2`.

**`src/auth/auth.service.ts`**
```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { User } from './entities/auth.entity';
import { AuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: AuthDto): Promise<User> {
    const hashedPassword = await argon2.hash(registerDto.password);
    const newUser = this.usersRepository.create({
      username: registerDto.username,
      password: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }

  async validateUser(username: string, pass: string) {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && await argon2.verify(user.password, pass)) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }
}
```
Similar to how we built the service layer for the Todo module, here we create the `AuthService` to handle all authentication logic. Its constructor injects the TypeORM `Repository<User>` using `@InjectRepository(User)` to work with users stored in the database, and also injects Nest’s `JwtService` to generate authentication tokens.

This service provides three main methods:
- `register()`: hashes the incoming password using **Argon2** for strong security, creates a new user entity with `this.usersRepository.create()`, and saves it to the database with `this.usersRepository.save()`.
- `validateUser()`: checks if the username exists, then verifies the password using `argon2.verify()`. If valid, it returns the user without the password field.
- `login()`: creates a JWT payload containing user data and signs it using `this.jwtService.sign()` to generate an `access_token`, which the user will use for authenticated requests.
#### Local Strategy 
The Local Strategy is used when a user tries to log in with a username and password. It checks the credentials before allowing access. Nest uses Passport under the hood to handle this process.   
**`src/auth/local.strategy.ts`**
```ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
```
This class tells Nest how to handle username/password login. `validate()` receives the login data and uses the `AuthService` to check if the user exists and the password is correct. If not valid, it throws an error. If valid, it returns the user so Nest can continue the login process.
#### JWT Strategy 
The JWT Strategy verifies the JWT token sent by the client. It runs automatically on routes protected with `@UseGuards(AuthGuard('jwt'))` and makes sure the request includes a valid token. If valid, it attaches user data to the request, this strategy runs on every protected route. It ensures the token is valid and extracts the user data.

**`src/auth/jwt.strategy.ts`**
```ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors(
        [
        (req) => req?.cookies?.token,  
      ]
      ),
      ignoreExpiration: false,
      secretOrKey: 'YOUR_VERY_SECRET_KEY_HERE',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```
This strategy checks the token in the request. If the token is valid, it returns the user data (`sub` and `username`) which Nest attaches to `request.user`. If the token is missing or invalid, access to the protected route is denied.
#### Creating Templates
Now lets create the login and register templates.    
**`views/auth/register.hbs`**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<div class="container">
    <h1>Create Account</h1>

    <form action="/auth/register" method="POST">
        <div>
            <label>Username</label>
            <input type="text" name="username" required placeholder="Enter username">
        </div>

        <div>
            <label>Password</label>
            <input type="password" name="password" required placeholder="Enter password">
        </div>

        <button type="submit">Register</button>
    </form>

    <a class="btn back" href="/auth/login">Already have an account? Login</a>
</div>
</body>
</html>
```
This template will handel registring user. 
**`views/auth/login.hbs`**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
	<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<div class="container">
    <h1>Login</h1>

    <form action="/auth/login" method="POST">
        <div>
            <label>Username</label>
            <input type="text" name="username" required placeholder="Enter username">
        </div>

        <div>
            <label>Password</label>
            <input type="password" name="password" required placeholder="Enter password">
        </div>

        <button type="submit">Login</button>
    </form>

    <a class="btn back" href="/auth/register">Don't have an account? Register</a>
</div>
</body>
</html>
```
This template will display when user try to log in
#### Creating Guard
When user is logged in it not necessary to let him get access to login and register route, we create guard, to check if user is logged in or not if it is it redirect the user to the `todo` route.   

**``src/auth/guard/guest.guard.ts``**
```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply } from 'fastify';

@Injectable()
export class GuestGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse<FastifyReply>();
    const token = req.cookies?.token;

    if (!token) return true;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'YOUR_VERY_SECRET_KEY_HERE',
      });

      if (payload) {
        res.redirect('/todo');
        return false;
      }

      return true;
    } catch (err) {
      res.clearCookie('token');
      return true;
    }
  }
}
```
#### Updating `AuthController` 
This controller handles the registration and login.

**`src/auth/auth.controller.ts`**
```ts
import { Controller, Post, Body, UseGuards, Request, Redirect,Get, Render, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/create-auth.dto';
import type { FastifyReply } from 'fastify';
import { User } from './entities/auth.entity';
import {GuestGuard} from "./guard/guest.guard"

@Controller('auth')
@UseGuards(GuestGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('register')
  @Render('auth/register')
  registerPage() {
    return {};
  }

  @Post('register')
  @Redirect("/auth/login")
  async register(@Body() registerDto: AuthDto, @Res({ passthrough: true }) res: FastifyReply) {
    await this.authService.register(registerDto);

  }

  @Get('login')
  @Render('auth/login')
  loginPage(@Request() req) {
    return {};
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @Redirect("/todo")
  async login(@Request() req, @Res({ passthrough: true }) res: FastifyReply) {
    const token = await this.authService.login(req.user);
      res.setCookie('token', token.access_token, {
      httpOnly: true,    
      path: '/',          
      sameSite: 'lax',    
    });
  }
}
```
The `AuthController` manages user registration and login flows while ensuring unauthorized users cannot access authentication pages.   
The entire controller is protected by the **`@UseGuards(GuestGuard)`**, which automatically redirects authenticated users away from the login and register pages.

- **`@Get('register')` / `@Post('register')`**: These methods handle displaying the registration form and processing its submission. The `register` POST route saves the new user via `AuthService` and uses the **`@Redirect("/auth/login")`** decorator to immediately redirect the user to the login page upon success.  
- **`@Get('login')`**: This displays the login form.  
- **`@Post('login')`**: This route is protected by **`@UseGuards(AuthGuard('local'))`** to validate the submitted username and password. If credentials are valid, the method generates a JWT using `authService.login()`, sets the resulting access token in an HTTP-only cookie (`res.setCookie`) for secure browser storage, and uses **`@Redirect("/todo")`** to send the user to the main application page. The cookie is set using the injected Fastify response object with `{ passthrough: true }`.

### Linking Tasks to Users
Now that users can register and receive a JWT, we link tasks to the owner,
#### Updating the `Todo` Entity
We add  `user` relationship to the `Todo` entity.

**`src/todo/entities/todo.entity.ts`**
```ts
import { ManyToOne, JoinColumn, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/auth.entity';

@Entity()
export class Todo {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column({ default: false })
  done: boolean;

  @CreateDateColumn()
  created_at: Date;
  
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

}
```
We added a new `ManyToOne` relationship to link each task to a specific user, this will allow us to query and retrieve only the tasks that belong to the logged-in user.
#### Implement the JWT Guard on Todo Routes
We use the `@UseGuards(AuthGuard('jwt'))` decorator to protect the `TodoController` routes and allow only logged in user to add task.

**`src/todo/todo.controller.ts`
```ts
import { UseGuards, Controller, Get, Post, Body, Render,Redirect, Res, HttpStatus,Request  } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './entities/todo.entity';
import type{ FastifyReply} from 'fastify';
import { AuthGuard } from '@nestjs/passport';
  
@Controller('todo')
@UseGuards(AuthGuard('jwt'))
export class TodoController {
    constructor(private readonly todoService: TodoService) {}
  
    @Get()
    @Render('todo/tasks')
    async taskList(@Request() req) {
        const userId = req.user.userId;
        const tasks = await this.todoService.findAllByUserId(userId);
        return { tasks };
    }


    @Get('add')
    @Render('todo/add_task')
    addTaskForm() {
        return {};
    }

    @Post('add')
    @Redirect('/todo')
    async addTask(@Body() createTodoDto: CreateTodoDto, @Res({ passthrough: true }) res: FastifyReply,@Request() req) {

        try {
            const userId = req.user.userId;
            return this.todoService.create(createTodoDto, userId);
        } catch (error) {
            console.error("Failed to create todo:", error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Error saving task.");
        }

    }

}
```
We did small fixes for our routes
- **`@Get()`**: extracts the authenticated user's ID from **`req.user.userId`** (which is populated by the `JwtStrategy`) and calls `todoService.findAllByUserId()` to fetch and display **only** the tasks belonging to the current user.

- **`@Post('add')`**: 
    - It retrieves the authenticated **`userId`** from the request.
    - It uses `todoService.create()` to save the new task, linking it to the current user.
    - The **`@Redirect('/todo')`** decorator automatically redirects the user back to the task list after the task is successfully created.
    - The `try...catch` block provides basic error handling, logging the failure and sending a 500 status response if saving the task fails.
#### Update `TodoService` 
Finally we modify the service to handle filtering and creation based on the `userId`.   
**`src/todo/todo.service.ts`**
```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { User } from '../auth/entities/auth.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  findAllByUserId(userId: number): Promise<Todo[]> {
        return this.todoRepository.find({ where: { user: { id: userId } } });
  }
  async create(createTodoDto: CreateTodoDto, user: User): Promise<Todo> {
    const newTodo = this.todoRepository.create({
      ...createTodoDto,
      user: user,
    });
    return this.todoRepository.save(newTodo);
  }

}
```
We replaced our old methods with new ones
- **`findAllByUserId(userId: number)`**: This method retrieves all tasks for a specific user. It uses a **nested TypeORM `where` clause (`{ user: { id: userId } }`)** to filter the `Todo` records based on the ID property of the related `user` entity. This is a robust way to query relational data in TypeORM.
- **`create(createTodoDto: CreateTodoDto, user: User)`**: This method creates a new task. It takes the task data (`CreateTodoDto`) and the **full `User` object** (which comes from the authenticated request). By setting **`user: user`** on the new `Todo` entity, TypeORM automatically handles setting the correct foreign key (`userId`) in the database.