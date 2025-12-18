## Objectives
- Understanding the shift from Server-Side Rendering to APIs.
- Building REST API with Nestjs
## Shifting from Server-Side Rendering to APIs.
### Introduction
In our past workshops, our apps used server-side rendering. With this approach, each request returned an entire HTML page. The problem is that every time we triggered an action in the web app or navigated to a new URL, the server re-rendered the whole page. This means we ended up downloading the full HTML again, even when only a small part of the page had changed.

This is referred to as a “Hotwire-like” approach, and while it works, it can slow down the application. Often, we only need to retrieve a small piece of data and update a specific section of the page, rather than reloading everything.

To fix this, we can use an API to send and receive small chunks of data and update just the required parts of the interface.
### API
API (**Application Programming Interface**) is a layer that we add to our web app to connect the frontend with the backend. Our app uses the API to retrieve and send data to the server. The backend receives the data, saves the results, processes whatever is needed, and then returns the updated information to the frontend.   
APIs make it easier to extend our application and make it available on platforms other than the browser. For example, if we want to build a mobile application for our web app, we only need to create the user interface and connect it to our web server using the API. The same backend logic and data can be reused without any changes.

![](./api.png)


### Javascript Role
To use the API in our web application, we rely on JavaScript.  
JavaScript handles communication with the server by fetching data from the API and then dynamically updating the DOM to reflect that data.

Now, instead of submitting a full form and reloading the page, we can let the user type in an input field, click a button, and then:
1. **Catch the click event** with JavaScript
2. **Send a request** to the API    
3. **Receive the response** from the server
4. **Update the DOM** using the data from the response


This way, only the necessary part of the page changes, and our app becomes much faster and smoother.
### REST API Architecture
There are many patterns to design APIs for our web apps, but the most common and beginner friendly one is the REST API.  
REST stands for Representational State Transfer. It is named this way because the server sends a representation of the requested resource usually as JSON, and the client is responsible for handling the state of the application on its side. 
### REST Main Properties
REST APIs are defined by several **mandatory constraints** that help achieve scalability, simplicity, and performance in a web service.
#### Stateless
Each request sent to the server must contain all the information needed to process it. The server does not store any information about previous requests. 
#### Client–Server Separation
The frontend and backend are separated.  
The frontend focuses only on the user interface and user experience, while the backend handles data storage and business logic. 
#### URLs Identify Resources
REST treats everything as a resource (users, tasks, posts, products, etc.).  
Each resource is identified by a clear and meaningful URL, for example:
- `/tasks`
- `/users/1`
#### Use of Standard HTTP Methods
REST relies on standard HTTP methods to describe actions instead of custom commands:
- **GET** Retrieve data
- **POST** Create new data
- **PUT / PATCH** Update existing data
- **DELETE** Remove data

By following these conventions, REST APIs remain predictable, easy to understand, and consistent across different applications.
## Building REST API with NestJs
Now that we understand how REST APIs work, we will apply these concepts by building a Task Management REST API.

The API will be responsible for registering users, authenticating logins, updating user profiles (including name and profile picture), and displaying, editing, and deleting tasks associated with each user.
### Setting Our Envirenment
We start by creating new NestJs project using
```
nest new workshop5
cd workshop5
```
### Installing Packages
After creating our project, it’s time to install the packages required for our application.

For this project, we will need `@nestjs/typeorm`, `typeorm`, and `sqlite3` to manage the database and work with an SQLite database. We will also use `class-validator` and `class-transformer` to validate submitted data.

To use Fastify as the HTTP adapter, we need `@nestjs/platform-fastify`. For server-side rendering, we will install `@fastify/view` and `handlebars` to configure the template engine and the `views` folder. To serve static files such as CSS and client-side JavaScript, we will use `@fastify/static`. The `@fastify/multipart` package will allow us to handle file uploads.

For authentication, we will use `argon2` to securely hash passwords, along with `@nestjs/passport`, `passport`, `passport-local`, `@nestjs/jwt`, `passport-jwt`, `@types/passport-local`, `@types/passport-jwt`, and `@fastify/cookie`.
```shell
npm install @nestjs/typeorm typeorm sqlite3 class-validator class-transformer @nestjs/platform-fastify @fastify/view handlebars @fastify/static @fastify/cookie @nestjs/passport passport passport-local @nestjs/jwt argon2 passport-jwt @types/passport-local @types/passport-jwt @fastify/multipart
```
### Creating Resource
For this project, we will work with three main resources:
- **User** responsible for managing user-related actions such as updating username, password, email, and avatar.    
- **Task**  responsible for creating, reading, updating, and deleting tasks that belong to authenticated users.
- **Auth** responsible for registration and login 

Let’s generate these resources using the NestJS CLI:
```shell
nest generate resource users
nest generate resource task
nest generate resource auth
```
When prompted, select REST API as the transport layer and choose Yes to generate the CRUD endpoints.

### Creating Database Models 
Now we move to creating our database models. we only need two core models: the **User** model and the Task model.

The User model represents application users and stores their basic information such as username, password, email, and avatar. The Task model represents tasks created by users, including details like task name, description, creation time, and current state (active or done).

There is a one-to-many relationship between users and tasks:
- A user can have many tasks
- Each task belongs to exactly one user

**`user/entities/ser.entity.ts`**
```js
import { OneToMany, Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
import { Task } from '../../task/entities/task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200, unique: true })
  username: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  avatar: string;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}
```
**User Model**
- `id`: Primary key that uniquely identifies each user
- `username`: Unique username for login and identification
- `email`: User email address (also unique)
- `password`: Stores the hashed password (never store plain text passwords)
- `avatar`: Optional field to store a profile picture URL or file path

The `tasks` attribute defines a one-to-many relationship, allowing us to access a user’s tasks using `user.tasks`.

We register our module in `users.module.ts`

**``users.module.ts``**
```js
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

```

Finally we create the task model

**`task/entities/task.entity`**
```ts
import { ManyToOne, JoinColumn, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;
  
  @Column({ default: "active" })
  state: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```
Task Model**
- `id`: Primary key for each task
- `name`: Task title
- `description`: Optional detailed description of the task
- `created_at`: Timestamp automatically set when the task is created
- `state`: Represents the task status (`active` or `done`)

The `userId` field is a foreign key that links each task to its owner. This ensures that every task belongs to a valid user.

We register our module in `task.module.ts`

**``task.module.ts``**
```js
import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Task } from './entities/task.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Task])], 
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}

```

### Initialize The Database
After defining our models, we need to initialize the database TypeOrm can create the corresponding tables. We do that by adding the following code inside the import array in the ``app.module.ts`` file.

**`app.module.ts`**
```js
@Module({
  imports:[
TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,

    })
    // other imports
  ]

  //..
})
```
### Creating The Data Validator
#### The User Validator 
We create validator to validate creating user 
**``create-user.dto.ts``**
```ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

}
```
We create two class one for validating the register and one for login , after that we update the `update-user.dto.ts` and make it use the register validator.     
**``update-user.dto.ts``**
```ts
import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './create-user.dto';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateUserDto extends PartialType(RegisterDto) {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;

}

export class UpdatePasswordDto extends PartialType(RegisterDto) {

  @IsString()
  @IsNotEmpty()
  password: string;
}
```
#### The Task Validator 
We need another validator for creating task.   
**``create-task.dto.ts``**
```ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

}
```