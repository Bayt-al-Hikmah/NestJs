## Objectives
- Working with Database and Models  
- Authentication and Session Management  
- Exploring Pipes, Guards, and Interceptors
## Databases, TypeScript, and NestJS ORMs
In our previous workshop, we created feedback application and we used TypeScript array to store users feedback, this work but the data  only in the server's RAM (memory), meaning it’s temporary, as soon as the NestJS server restarts, shuts down, or crashes whether due to maintenance, updates, or deployment all the information in that array is instantly lost.   
To build real, reliable backend services, we need a way to store data permanently, so it remains available even after the server restarts. This is where databases come in.
### Database
A database is a specialized, structured system for storing, managing, and retrieving information efficiently. Instead of vanishing when the server stops, a database saves our data permanently on disk, ensuring it's still there the next time our application starts.   
Databases are essential because they:  
- **Store data persistently** .
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
A relational database stores data in tables, similar to how a spreadsheet organizes information, each table represents a specific entity type for example, a `Customers` table or an `Orders` table, each row in a table represents a single record a specific customer, order, or product, each column defines a property or field, describing what kind of information is stored such as `name`, `email`, `order_date`, or `total_amount`.
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
- The `id` column serves as the primary key, guaranteeing that no two customers share the same identifier.

The database enforces data integrity by applying rules such as data types (text, numbers, dates) and constraints (e.g., required fields or unique values).
#### Foreign Keys and Relationships
Relational databases are powerful because they can define relationships between tables, linking related data without duplicating it. This is done through foreign keys.

A foreign key is a column in one table that refers to the primary key of another table. This creates a connection between records and ensures consistency.
### Common Types of Relationships
#### One-to-One
Each record in Table A is linked to exactly one record in Table B, and vice versa.

Example: A ``Users`` table and a ``UserProfiles`` table, linked by a foreign key referencing the user’s id.
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
### Understanding ORMs/ODMs 
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
In NestJS, we use TypeORM to interact with the database.  Lets explore how that work by creating todo app, user can add and save task in the database.    
We need first to create a new NestJS project named **`workshop3`** 
```shell
nest new workshop3
cd workshop3
```
After that we generate the `todo` resource using the following commands:
```shell
nest generate resource todo
```
It will propmet us to select the project type we go for Rest Api and it will ask if we want to create the CRUD operation we select yess.
#### Setting Fastify Adapter
We set out app to use the fastify adapter installing the following packages
```
npm install @nestjs/platform-fastify fastify
```
and adding the following configuration to our ``main.ts``
```ts
import {FastifyAdapter,NestFastifyApplication, } from '@nestjs/platform-fastify'; // we add this import

//we change the default app  to this inside the boostrap function
const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
```
#### Installing Packages
Now We need to install the necessary packages, we will use sqlite as database manager, and TypeORM as our ORM.
```
npm install @nestjs/typeorm typeorm sqlite3
```
#### Defining The Todo Entity
Now we are set we define the database Schema inside the **`src/todo/entities/todo.entity.ts`** file.    

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
  done: boolean;

  @CreateDateColumn()
  created_at: Date;
}
```
TypeORM will use this schema to create our database table, We used the `@Entity()` Decorator to mark the `Todo` class,this will automatically map it to the corresponding table in our database.  
The class has the following properties, which define the columns of that table:
- **`id`**: Its type is `number` and it uses the `@PrimaryGeneratedColumn()` decorator. it automatically sets this property as the table's primary key and ensures its value is auto-generated (usually auto-incremented) by the database.
- **`title`**: Its type is `string`. It uses `@Column({ length: 200 })` which means it represents a standard text column in the table and has a constraint limiting the value to a maximum of 200 characters.   
- **`description`**: Its type is `string`. It uses `@Column('text')`, which tells the database to use a longer text data type, similar to a `TEXT` or `CLOB` field, suitable for detailed descriptions.
- **`done`**: Its type is `boolean`. It uses `@Column({ default: false })`. This property tracks the completion status of the task, and the `default: false` option ensures that any new task created will automatically be marked as not done.
- **`created_at`**: Its type is `Date`. It uses the `@CreateDateColumn()` decorator. This is a special decorator that automatically populates the field with the **timestamp** of when the row was first inserted into the database, handling our need for automatic time recording.

After creating an Entity, we need to add it to our `todo.module.ts` import configuration , this will make it accessible in our app.

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
Here we add import to the **`TodoModule`** and we use **`TypeOrmModule.forFeature([Todo])`**, this will make the `Todo` database entity available for use by the **`TodoService`** and is necessary for NestJS to manage the corresponding database table and allow us to perform CRUD operations on it.   
#### Configuring the app.module
Finally we need to add the database connection and configuration to the `app.module` file.
```ts
// other imports
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({

  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,

    }),
    // other imports
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
```
The `TypeOrmModule.forRoot()` method configures the database connection, we are set type to `'sqlite'`,this will set SQLite as the database, we specify the database file name under the `database` property. We also provide the list of entity files so TypeORM knows which models to map to database tables. Finally The `synchronize: true` option automatically updates the database schema to match our entity definitions (such as those in `todo.entity.ts`) every time the application starts. This is useful during development, but it should be set to `false` in production to avoid unintentional data loss or schema changes.
#### Creating the DTOs 
Lets create the DTOs to define the expected structure and validation for data coming in from the client.    
We first install the package
```shell
npm install class-validator class-transformer
```
**`src/todo/dto/create-todo.dto.ts`:**
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
#### Creating the Service
Now lets create the **`TodoService`**  which is responsible for communication with the database.  
**`src/todo/todo.service.ts`**, 
```ts
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

  
  findAll(): Promise<Todo[]> {
    return this.todoRepository.find();
  }

  create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const newTodo = this.todoRepository.create(createTodoDto);
    return this.todoRepository.save(newTodo);
  }
}
```
We created the  `TodoService` to handel the logic layer for the `Todo` module. It constructor manage data access to our database by injecting the TypeORM `Repository<Todo>` using the `@InjectRepository(Todo)` decorator.      
The service exposes two main methods: 
- `findAll()`, which uses `this.todoRepository.find()` to query and return all tasks from the database; and 
- `create()`, which first uses `this.todoRepository.create()` to map the incoming `CreateTodoDto` data into a valid `Todo` entity instance, and then uses `this.todoRepository.save()` to persist the new task to the database. This pattern keeps the database logic neatly centralized.
#### The Controller 
Finally we edit our controller, we will need three route, one for displaying form so user can add a todo task, one to handel the form submitted data and the last route to display user todo tasks
```ts
import { Controller, Get, Post, Body, Render, Res, HttpStatus,Redirect } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import type { FastifyReply } from 'fastify'


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
    async addTask(@Body() createTodoDto: CreateTodoDto, @Res() res: FastifyReply) {
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
#### Creating The Template
We install and set the template engine
```
npm install @nestjs/platform-fastify @fastify/view handlebars
```
After that we configure the ``main.ts`` file to use the Fastify adapter and we register the `@fastify/view` plugin that will render our templates.
```ts
// add this import
import { join } from 'path'; 
import * as handlebars from 'handlebars';

  // Register the view engine inside boostrap function
  app.register(require('@fastify/view'), {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'),
  });

```
We create our templates, we need two templates.  
Template to recive the `tasks` array from the controller and loop through it to display the todo items.
**``views/todo/tasks.hbs``**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My To-Do List</title>
    <link rel="stylesheet" href="/static/css/style.css">
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
And template that include the form that posts the data to the controller.
**``views/todo/add_task.hbs``**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Add New Task</title>
    <link rel="stylesheet" href="/static/css/style.css">
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
            <button type="submit">Save Task</button> <a href="/todo" class="btn back">Back to List</a>
        </form>
        
    </div>
</body>
</html>
```
#### Adding Style
We will use the style that exist in the material folder, we first need to configure our app to load static files,
```shell
npm install @fastify/static
```
Then we configure our ``main.ts`` file file to load the style from folder named public by registring the `@fastify/static` plugin
```ts
//we add this inside the boostrap function
await app.register(require('@fastify/static'), {
  root: join(__dirname, '..', 'public'), 
  prefix: '/static/', 
  });

```
#### Running The App
We run our app with `npm run start:dev` the routes will be available at:
- **`GET http://localhost:3000/todo`**: To retrieve the list of tasks (equivalent to visiting the list view).
- **`POST http://localhost:3000/todo`**: To submit a new task (equivalent to submitting the form).

## Authentication, Authorization and Session Management in NestJS
Authentication is the process of verifying the identity of a user, device, or system before granting access to resources or data.  
Authorization is the process of verifying if a user is authorizad to do a specific action.  
Authentication typically involves credentials like usernames and passwords, but it can also include more advanced methods such as two-factor authentication (2FA), biometrics, or token-based systems.
### Session
A session is a way to store information about a user across multiple requests. Since HTTP is a stateless protocol (it doesn’t remember anything between requests), sessions allow us to persist data like login status, user preferences, or temporary messages while the user navigates through the app.
### Implementing Session Authentication

#### Install Packages
We need to install the following packages `@fastify/cookie` and `@fastify/secure-session` to set sessions, ``argon2`` for password hashing and ``dotenv`` for environment variables 
```ts
npm install @fastify/cookie  @fastify/secure-session argon2 dotenv
```
We create `.env` file to store the session secret key, we create it outside and same level as `.env` folder
**`.env`**
```
SECRET=ESCc0b$_pHb3cD1noYktoYzV9G_*b+e?Pg:wa7u!3.jjXt`w^Tcj;Fo7h&wo
```
We install the plugin in  our ``main.ts`` file
```ts
  await app.register(require('@fastify/cookie'))
  require('dotenv').config();
  await app.register(require('@fastify/secure-session'), {
    secret:  process.env.SECRET,
    cookie: {
      secure: false,       
      httpOnly: true,      
      sameSite: 'lax',     
      maxAge: 15 * 60 * 1000 
    },
    saveUninitialized: false,
  });
```
We installed and configured or session
``secret`` The secret key used to encrypt and sign session data. It should be a strong, random value and is usually stored in environment variables to keep it secure.

``cookie.secure`` Determines whether the cookie is sent only over HTTPS.

- **true** cookie is sent only on secure (HTTPS) connections
- **false** cookie can be sent over HTTP (useful for local development)


``cookie.httpOnly`` When set to true, the cookie cannot be accessed by JavaScript running in the browser. This helps protect against XSS (cross-site scripting) attacks.

``cookie.sameSite`` Controls when cookies are sent with cross-site requests.

- 'lax' allows cookies on top-level navigation while still protecting against most CSRF attacks
- 'strict' → strongest protection but may break some flows
- 'none' → allows cross-site usage (requires HTTPS)

``cookie.maxAge`` Defines how long the session cookie is valid, in milliseconds. In this case, 15 * 60 * 1000 means the session expires after 15 minutes.

``saveUninitialized`` If set to false, a session is not created or stored until some data is added to it. This reduces unnecessary cookies and improves performance.
#### Creating the Module
After that, we generate a new resource for the authentication module, this new resource will handle registration, login, and sessions.
```
nest g resource auth
```
Now we start building our module logic
#### Creating Entity
We define a `User` entity that will store user credentials.   
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
The User have password and username and also id field automaticly generated ,username is unique we can't have two person with same username, We also create OneToMany relationship between our user and todo items, a user can have many tasks. and task can belong to only one user

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
#### Creating The DTO
After creating our entity we create the DTO to validate user input, we remove everything inside `create-auth.dto.ts` and create the following two class
**``src/auth/dto/create-auth.dto.ts``**
```ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class AuthDto  {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```
User most submit username and password, user name is max length 50 characters
#### Configure `AuthModule` 
We we add the TypeORM entity to our `AuthModule` imports, so it will be accessible for our resource

**`src/auth/auth.module.ts`**
```ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```
We  registered the `User` entity with TypeORM so our application can store and read user data from the database.
#### Implement `AuthService`
The service handles database interaction (saving/finding users) and password hashing/comparison using `argon2`.

**`src/auth/auth.service.ts`**
```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './entities/auth.entity';
import { AuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
   constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

  ) {}

  async register(registerDto: AuthDto): Promise<User> {
    const hashedPassword = await argon2.hash(registerDto.password);
    const newUser = this.usersRepository.create({
      username: registerDto.username,
      password: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }

  async login(loginDto: AuthDto): Promise<User|null>  {
    const user = await this.usersRepository.findOne({ where: { username:loginDto.username} });
    if (user && await argon2.verify(user.password, loginDto.password)) {
      
      return user;
    }
    return null;
  }
}
```
We create the `AuthService` to handle all authentication logic. Its constructor injects the TypeORM `Repository<User>` using `@InjectRepository(User)` to work with users stored in the database.

This service provides three main methods:
- `register()`: hashes the incoming password using Argon2 for strong security, creates a new user entity with `this.usersRepository.create()`, and saves it to the database with `this.usersRepository.save()`.
- `Login()`: checks if the username exists, then verifies the password using `argon2.verify()`. If valid, it returns the user.

#### Update TodoService 
We have modify the service to handle filtering and creation based on the `userId`, set user when creating task.     
**`src/todo/todo.service.ts`**
```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import type { User } from '../auth/entities/auth.entity';

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
- **`findAllByUserId(userId: number)`**: This method retrieves all tasks for a specific user. It uses a nested TypeORM `where` clause (`{ user: { id: userId } }`) to filter the `Todo` records based on the ID property of the related `user` entity.
- **`create(createTodoDto: CreateTodoDto, user: User)`**: This method creates a new task. It takes the task data (`CreateTodoDto`) and the full `User` object. By setting **`user: user`** on the new `Todo` entity, TypeORM automatically handles setting the correct foreign key (`userId`) in the database.

### Creating Guard
Guard is a special class used to control access to routes by determining whether a request should be handled or rejected, A Guard implements the ``CanActivate`` interface, and its ``canActivate()`` method returns true to allow the request or false to block it.

We will create two guard one see if user authorized and the other to see if the user is guest, the guard redirect the user depend on his state 
**``src/auth/guard/auth.guard.ts``**
```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
@Injectable()
export class Authorized implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest(); 
    const res = context.switchToHttp().getResponse(); 
    const id =  req.session.get("userId");
    
    if (!id){
       return res.redirect('todo/login'); 
    } 
    return true;
  }
}

@Injectable()
export class Guest implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();  
    const res = context.switchToHttp().getResponse();  
    const id = req.session.get("userId");
    
    if (!id){
      return true;
    } 
    return res.redirect('/todo');

  }
}
```
### Creating the AuthController
Now lets create the `AuthController` which will handel login and register.

**`src/auth/auth.controller.ts`**
```ts
import { Controller, Post, Body, UseGuards, Get, Render, Req,Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/create-auth.dto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { Guest } from "./guard/auth.guard"
import type {Session } from '@fastify/secure-session'

@Controller('todo')
@UseGuards(Guest)
export class AuthController {
  constructor(private readonly authService: AuthService,
    
  ) {}
  @Get('register')
  @Render('auth/register')
  registerPage() {
    return {};
  }
  @Post('register')
  async register(@Body() registerDto: AuthDto,@Res() res:FastifyReply ) {
    const user = await this.authService.register(registerDto);
    if(user){
      return await res.status(301).redirect("/todo/login")
    }
    return res.status(301).redirect("/todo/register")
  }

  @Get('login')
  @Render('auth/login')
  loginPage() {
    return {};
  }
  @Post('login')
  async login(@Body() login :AuthDto, @Req() req:FastifyRequest,@Res() res:FastifyReply) {
    const user = await this.authService.login(login);
    if(user){
       await (req.session as any).set("userId",String(user.id) )
       res.status(301).redirect("/")
    }
     res.status(301).redirect("/todo/login")
  }
}
```
The `AuthController` manages user registration and login flows.   
The entire controller is protected by the **`@UseGuards(Guest)`**, which automatically redirects authenticated users away from the login and register pages.

- **`@Get('register')` / `@Post('register')`**: These methods handle displaying the registration form and processing its submission. The `register` POST route saves the new user via `AuthService` and uses the **`res.status(301).redirect("/todo/login")`**  to immediately redirect the user to the login page upon success.  
- **`@Get('login')`**: This displays the login form.  
- **`@Post('login')`**: This route validate the submitted username and password. If credentials are valid, the method the user session, and uses **`res.status(301).redirect("/")`** to send the user to the main application page. 

### Editing The Todo controller
We also need to edit the todo controller to apply the guard and to use the new service methods  
**`src/todo/todo.controller.ts`**
```ts
import { UseGuards, Controller, Get, Post, Body, Render,Redirect, Res, HttpStatus,Req  } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import type{ FastifyRequest, FastifyReply } from 'fastify';
import { Authorized } from '../auth/guard/auth.guard'

@Controller('todo')
@UseGuards(Authorized)
export class TodoController {
    constructor(private readonly todoService: TodoService) {}
  
    @Get()
    @Render('todo/tasks')
    async taskList(@Req() req:FastifyRequest) {
        const userId =  (req.session as any).get('userId');
        console.log(userId )
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
    async addTask(@Body() createTodoDto: CreateTodoDto,@Req() req:FastifyRequest,@Res() res:FastifyReply) {
        try {
            const userId = await req.session.get('userId');
            return this.todoService.create(createTodoDto, userId);
        } catch (error) {
            console.error("Failed to create todo:", error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Error saving task.");
        }
    }
    @Get('logout')
    async logout(@Req() req:FastifyRequest,@Res() res:FastifyReply) {
      await req.session.delete()
      res.status(301).redirect("/todo/login")
    }
}
```
We added new route to log user out 
- **`@Get('logout')`**: This will log the user out. 
### Editing the main Controller
Lets edit the main controller to redirect user to our todo route instead of displaying ``hello world``

**``app.controller.ts``**
```ts
import { Controller, Get,Res,Req } from '@nestjs/common';
import { AppService } from './app.service';
import type{ FastifyReply } from 'fastify';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(@Res() res:FastifyReply){
    res.status(301).redirect("/todo")
  }
}
```
### Creating Templates
Finally lets create the login and register templates.    
We start with registration template.  
**`views/auth/register.hbs`**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
<div class="container">
    <h1>Create Account</h1>
    <form action="/todo/register" method="POST">
        <div>
            <label>Username</label>
            <input type="text" name="username" required placeholder="Enter username">
        </div>
        <div>
            <label>Password</label>
            <input type="password" name="password" required placeholder="Enter password">
        </div>
        <button type="submit">Register</button> <a class="btn back" href="/auth/login">Already have an account? Login</a>
    </form>
</div>
</body>
</html>
```
We also create template for login in user.  
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
        <button type="submit">Login</button> <a class="btn back" href="/auth/register">Don't have an account? Register</a>
    </form>
</div>
</body>
</html>
```
## Exploring Pipes, Guards, and Interceptors
In any robust backend application, an incoming HTTP request must pass through several stages before it reaches the business logic and returns a response. NestJS formalizes this process using Pipes, Guards, Interceptors, and Exception Filters. These tools allow us to cleanly separate concerns like validation, authorization, logging, and error handling from the main controller and service logic.
### Request Lifecycle
The NestJS request pipeline follows a predictable path. A request enters your application and proceeds through the components in this specific order:
- **Incoming Request:** The request hits the server.
- **Guards:** Checks authorization (e.g., Is the user logged in? Does the user have the required role?). If a Guard fails, the request is blocked immediately.
- **Interceptors (Pre-Controller):** Logic executed before the controller handler runs (e.g., logging the request).
- **Pipes (Parameter-level):** Validation and transformation of data for specific route parameters (e.g., ensuring an ID is a valid number, validating the DTO body).
- **Controller Handler:** Your main business logic starts executing (e.g., `TodoController.create()`).
- **Service/Database Logic:** The service executes the core logic (e.g., `TodoService.create()`).
- **Interceptors (Post-Controller):** Logic executed **after** the controller/service returns, allowing you to transform the final result or handle the promise (e.g., caching, standardizing the response format).
- **Exception Filters:** If any component (Guard, Pipe, Controller, Service) throws an exception, the Exception Filters catch it and standardize the HTTP error response.
- **Outgoing Response:** The final response is sent back to the client.
### Pipes: Validation and Transformation
Pipes are classes decorated with `@Injectable()` that implement the `PipeTransform` interface. They execute immediately before a controller handler is called, operating directly on the arguments.
####  Data Validation with `ValidationPipe`
The built-in **`ValidationPipe`** is the most common use case. we use it to validate the data that sent by the users  , it ensure incoming data meets the structural and content rules defined in our DTOs.   
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
async addTask(@Body() createTodoDto: CreateTodoDto, @Res({ passthrough: true }) res: FastifyReply,@Request() req)
```
By specifying `@Body() createTodoDto: CreateTodoDto`, NestJS checks the request data according to the rules defined in `CreateTodoDto`.
#### Building Custom Pipes
We can build custom pipes to handle specific transformations, for example a custom pipe can be used to convert an incoming string ID (from a URL path) directly into a database entity object, simplifying controller code.

**``src/common/pipes/parse-int.pipe.ts``**
```ts
// src/common/pipes/parse-int.pipe.ts 
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
// The ParseIntPipe is executed before the handler, guaranteeing 'id' is a number 
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
We already implemented the `GuestGuard` and used the built-in `AuthGuard('jwt')`. A powerful use of Guards is for **Role-Based Access Control (RBAC)**.   
To check for a specific role:
1. **Define Roles (Metadata):** Use a custom decorator and the `@SetMetadata()` decorator to attach role requirements to a controller method.
2. **Check Roles (Guard):** Create a generic `RolesGuard` that reads this metadata and compares it against the user's roles.
    

This pattern allows us to define complex access rules with a single line:

```ts
@Post() 
@SetMetadata('roles', ['admin', 'manager']) 
async create(@Body() createTodoDto: CreateTodoDto) { /* ...*/ } 
// 2. The RolesGuard checks if the authenticated user has at least one of these roles 

@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Controller('todos') export class TodoController { /* ... */ }
```
The `@Post()` endpoint has metadata specifying allowed roles (`admin` and `manager`) using `@SetMetadata('roles', [...])`. When a request is made, the `RolesGuard` reads this metadata and checks if the authenticated user (validated by the JWT `AuthGuard`) has at least one of the required roles. If the user doesn't have a matching role, access is denied; otherwise, the action is allowed.
### Interceptors:
Interceptors implement the `NestInterceptor` interface and allow us to bind extra logic before or after the execution of the main controller handler. They are powerful for implementing cross-cutting concerns cleanly.
#### Response Transformation
Interceptors often transform the final data structure, ensuring all API responses conform to a unified format (e.g., wrapping data in a `data` key).
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
This interceptor automatically formats every response returned by your controllers. When a request is processed, the interceptor lets the handler run, then uses `map()` to wrap the original response data in a consistent structure. It adds useful extra fields  such as the HTTP status code and a timestamp and places the controller's actual output inside a `data` field. This helps enforce a unified API response format across the application without changing each controller manually.
#### Logging and Timing
Interceptors are ideal for timing requests, as they can execute logic both before the controller is called and after the final result is available.
```ts
// src/common/interceptors/logging.interceptor.ts 
// ... imports ... 
import { tap } from 'rxjs/operators'; 

@Injectable() 
export class LoggingInterceptor implements NestInterceptor { 
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> { 
		const now = Date.now(); 
		console.log(`[REQUEST] ${context.getClass().name} starting...`); 
		return next.handle().pipe( 
			tap(() => console.log(`[RESPONSE] Completed in ${Date.now() - now}ms`)), 
		); 
	} 
}
```
We can apply these using `@UseInterceptors(TransformInterceptor)` at the controller, method, or global level.
### Exception Filters
When an exception is thrown in any part of the lifecycle (Pipe, Guard, Interceptor, or Service), NestJS's default handler catches it and sends a generic response. Exception Filters allow us to customize and standardize this error handling globally.
#### Handling and Standardizing Error Responses Globally
By default, NestJS handles built-in exceptions like `NotFoundException` and `BadRequestException` correctly. To catch all exceptions and ensure a standard response format, we create a global filter.
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
		// Check if it's a known HTTP exception or a generic server error 
		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR; 
		const message = exception instanceof HttpException ? (exception.getResponse() as any)?.message || exception.message : 'Internal server error'; 
		// Send standardized JSON error response 
		response.status(status).send({ 
			statusCode: status, 
			timestamp: new Date().toISOString(), 
			path: request.url, 
			message: message, 
		}); 
	} 
}
```
To use it globally, we need to register it in our `main.ts`:
```ts
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
	// other codes
	app.useGlobalFilters(new AllExceptionsFilter());
	// other code
	
}
```
#### Creating Custom Exception Filters for Specific Errors
We can also create a filter to handle only a specific, non-HTTP exception type from our business logic, like a `UserNotFoundException`.
```ts
// @Catch(UserNotFoundException) 
// export class UserNotFoundFilter implements ExceptionFilter { /* ... */ }
```
### Custom Decorators
Custom Parameter Decorators (e.g., `@User()`) abstract away the boilerplate of manually extracting data from the request object in every controller. They leverage the `createParamDecorator` function.
#### Building `@User()` Decorators
Lets create simple `@User()` decorator it simplify access to The `JwtStrategy` populates `req.user`
```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'; 

export const User = createParamDecorator( 
	(data: unknown, ctx: ExecutionContext) => { 
		const request = ctx.switchToHttp().getRequest(); // 'req.user' is populated by Passport/JwtStrategy 
		return request.user; 
		}, 
	);
```
Now we can use it inside our controller
```ts
// src/todo/todo.controller.ts
// ....
async taskList(@User() user) { 
	// Cleanly get the user object injected into the handler 
	const userId = user.userId; 
	const tasks = await this.todoService.findAllByUserId(userId); 
	return { tasks }; 
}

// ....
```
This pattern keeps the controller focused on routing and leaves the data extraction and manipulation to the specialized components (Guards, Pipes, and Decorators).
