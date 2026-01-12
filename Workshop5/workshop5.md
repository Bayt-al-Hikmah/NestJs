## Objectives
- Understanding the shift from Server-Side Rendering to APIs.
- Building REST API with Nestjs
## Shifting from Server-Side Rendering to APIs.
### Introduction
In our past workshops, we used server-side rendering. With this approach, each request returned an entire HTML page. The problem is that every time we triggered an action in the web app or navigated to a new URL, the server re-rendered a whole page. This means we ended up downloading the full HTML again, even when only a small part of the page had changed.

This is referred to as a “Hotwire-like” approach, and while it works, it slow down the application. Often, we only need to retrieve a small piece of data and update a specific section of the page, rather than reloading everything.

To fix this, we can use an API to send and receive small chunks of data and update just the required parts of the interface.
### API
API (Application Programming Interface) is a layer that we add to our web app to connect the frontend with the backend. Our app uses the API to retrieve and send data to the server. The backend receives the data, saves the results, processes whatever is needed, and then returns the updated information to the frontend.   
APIs make it easier to extend our application and make it available on other platforms. For example, if we want to build a mobile application, we only need to create the user interface and connect it to our web server using the API. The same backend logic and data can be reused without any changes.

![](./api.png)


### Javascript Role
To use the API in our web application, we rely on JavaScript.  
JavaScript handles communication with the server by fetching data from the API and then dynamically updating the DOM to reflect that data, Instead of submitting a full form and reloading the page, we can let the user type in an input field, click a button, and then:
1. Catch the click event with JavaScript
2. Send a request to the API    
3. Receive the response from the server
4. Update the DOM using the data from the response


This way, only the necessary part of the page changes, and our app becomes much faster and smoother.
### REST API Architecture
There are many patterns to design APIs for our web apps, but the most common and beginner friendly one is the REST API.  
REST stands for Representational State Transfer. It is named this way because the server sends a representation of the requested resource usually as JSON, and the client is responsible for handling the state of the application on its side. 
### REST Main Properties
REST APIs are defined by several mandatory constraints that help achieve scalability, simplicity, and performance in a web service.
#### Stateless
Each request sent to the server must contain all the information needed to process it. The server does not store any information about previous requests. 
#### Client–Server Separation
The frontend and backend are separated, The frontend focuses only on the user interface and user experience, while the backend handles data storage and business logic. 
#### URLs Identify Resources
REST treats everything as a resource (users, tasks, posts, products, etc.), Each resource is identified by a clear and meaningful URL, for example:
- `/tasks`
- `/users/1`
#### Use of Standard HTTP Methods
REST relies on standard HTTP methods to describe actions instead of custom commands:
- ``GET`` Retrieve data
- ``POST`` Create new data
- ``PUT / PATCH`` Update existing data
- ``DELETE`` Remove data

By following these conventions, REST APIs remain predictable, easy to understand, and consistent across different applications.
## Building REST API with NestJs
Now that we understand how REST APIs work, we will apply these concepts by building a Task Management REST API.  
The API will be responsible for registering users, authenticating logins, updating user profiles, and displaying, editing, and deleting tasks associated with each user.
### Setting Our Envirenment
We start by creating new NestJs project using
```
nest new workshop5
cd workshop5
```
### Installing Packages
After creating our project, it’s time to install the packages required for our application.

For this project, we will need `@nestjs/typeorm`, `typeorm`, and `sqlite3` to manage the database and work with an SQLite database. We will also use `class-validator` and `class-transformer` to validate the data sent by user.

To use Fastify adapter, so  we need `@nestjs/platform-fastify`. For server-side rendering, we will install `@fastify/view` and `handlebars`. To serve static files we use `@fastify/static`. User will upload avatar picture so we need `@fastify/multipart`.

Finally for authentication, we will use `argon2` to securely hash passwords, along with `@fastify/secure-session` and `@fastify/cookie`, to save loged in user in session.
```shell
npm install @nestjs/typeorm typeorm sqlite3 class-validator class-transformer @nestjs/platform-fastify @fastify/view handlebars @fastify/static @fastify/cookie argon2 @fastify/multipart dotenv
```
### Creating Resource
For this project, we need three main resources:
- User: responsible for managing user-related actions such as updating username, password, email, and avatar.    
- Task:  responsible for creating, reading, updating, and deleting tasks that belong to authenticated users.
- Auth: responsible for registration and login 

Let’s generate these resources using the NestJS CLI:
```shell
nest generate resource users
nest generate resource task
nest generate resource auth
```
When prompted, select REST API as the transport layer and choose Yes to generate the CRUD endpoints.
### Creating The Database Entities 
We need two core entities: the User entity and the Task entity.   
The User Entity represents application users and stores their basic information such as username, password, email, and avatar. The Task model represents tasks created by users, including details like task name, description, creation time, and current state (active or done).

We also add a one-to-many relationship between users and tasks:
- A user can have many tasks
- Each task belongs to exactly one user

**`user/entities/user.entity.ts`**
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
- `id`: Primary key that uniquely identifies each user
- `username`: Unique username for login and identification
- `email`: Unique user email address
- `password`: Stores the hashed password 
- `avatar`: Store a profile picture name. 

The `tasks` attribute defines a one-to-many relationship, allowing us to access a user’s tasks using `user.tasks`.

After creating The Entity we register it in `users.module.ts`, by adding it to the imports.

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
### Creating The User DTO
Now we create the data validator and transformer for the User, We will need four DTO.
- Registration DTO which we use when user try to register and create new account
- Login DTO
- Update User DTO we use when the set try update his account information
- Finally Update Password DTO, we use when user try to update his password

Lets start by creating,Registration and Login Dtor inside `users/dto/create-user.dto.ts`.  
Registration Dto will need four string fields, username, email, password and avatar.  
Login Dto will need only two string fields,emails and password.  
```ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserDto {
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

  @IsString()
  @IsNotEmpty()
  avatar: string;
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
After that we create the update user and update password Dto inside `users/dto/update-user.dto.ts`.   
The Update User Dto need three string fields, email and username are required but the avatar is optional.   
The Update Password Dto need Only one required field which is the password.  
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsNotEmpty, MaxLength,IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;
  
  @IsOptional()
  avatar?: string;
}

export class UpdatePasswordDto extends PartialType(CreateUserDto) {

  @IsString()
  @IsNotEmpty()
  password: string;
}
```
### Creating The Task Entity
Now we move to create the Task Entity   
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
Task Model
- `id`: Primary key for each task
- `name`: Task title
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
### Creating The Task Dto
We Also need  Data validator for Tasks, we need two Dto when for Creating task, and one for updating the task.  
We start with Create Task Dto we create it inside `task/dto/create-task.dto.ts`, it need only one required field which is the task name.
```ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;
}
```
After that we create the Update Task Dto inside `task/dto/update-task.dto.ts`, we can update only the task state so we will need only one string fiels.  
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    state: string;
}
```
### Initialize The Database
After defining our entities, we need to initialize the database, so TypeOrm can create the corresponding tables. We do that by adding the database configurtion inside the import array in the ``app.module.ts`` file.

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
### Creating Guards
When a user is logged in, we remove their access to the Login and Registration routes. When a user is not authenticated, we prevent them from performing any actions on the task-related routes. We handle this by using route guards. 
We create an Authorization Guard to protect routes that require an authenticated user, and another guard to prevent logged-in users from accessing authentication routes (such as Login and Registration).  
**``src/guard/authorization.guard.ts``**
```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class Authorized implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest(); 
    const res = context.switchToHttp().getResponse(); 
    const id =  req.session.get("userId");
    if (!id){
       return res.status(403).send({message:"Not Authorized"}); 
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
    return res.status(403).send({message:"You Aleardy Logged in"}); 
  }
}
```
### Creating The Parametre Decorator
We submitting files so we also need parametre decorator, to retrive the file from the form. and another parametre decorator for retriving form fields.  

We start with the `File` decorator, it loop over the form data when it find field named type it return it content.  
**``parameter_decorators/parametre.decorator.file.ts``**
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
      for await (const part of parts) {
        if (part.type === 'file') {
          return part;   
        }
      }
    
    } catch (error) {
      console.error('File upload error:', error);
      throw new InternalServerErrorException('File upload failed due to a server error.');
    }
    return null;
}   
)
```
After that we create parameter decorator to retrive the form field and return them as CreateUserDtor or UpdateUserDto.  
**``parameter_decorators/parametre.decorator.fields.ts``**
```ts
import { createParamDecorator, ExecutionContext} from '@nestjs/common';
import { CreateUserDto} from '../users/dto/create-user.dto';
import { UpdateUserDto} from '../users/dto/update-user.dto';
export const Fields= createParamDecorator(

  async (data: unknown, ctx: ExecutionContext):Promise<CreateUserDto|UpdateUserDto> => {

    const request = ctx.switchToHttp().getRequest(); 
    const parts = request.parts();
    let avatar = '';
      let typeDto: CreateUserDto|UpdateUserDto = {} as CreateUserDto|UpdateUserDto;
      for await (const part of parts) {
          if (part.type !== 'file') {
            typeDto[part.fieldname] = part.value;
          }else{
            break;
          }
        }
        return typeDto;
    } 
)
```
### Creating The Services and Controllers
Now everything is set we start to create our services and controllers.
#### The Auth Service
We start with the authorification service, we will create three methods2.
- ``uploadAvatar`` this method handel uploading the avatar image to our server.
- ``register`` this method to save new user record in our database
- ``login`` finally this will verify email and password and log user in.
```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateUserDto, LoginDto} from '../users/dto/create-user.dto';
import * as argon2 from 'argon2';
import { MultipartFile} from '@fastify/multipart';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) 
    private authRepository: Repository<User>
  ) {}

  async uploadAvatar(file: MultipartFile): Promise<string> {
    const fileExtension = file.filename.split('.').pop();
    const uniqueId = randomUUID();
    const newFilename = `${uniqueId}.${fileExtension}`;
    const filePath = join(process.cwd(), 'public/avatars', newFilename);

    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      file.file.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
    return newFilename;
  }
  
  async register(CreateUserDto: CreateUserDto): Promise<User> {
    CreateUserDto.password = await argon2.hash(CreateUserDto.password);
    const newUser = this.authRepository.create(CreateUserDto);
    return this.authRepository.save(newUser);
  }
  
  async login(LoginDto: LoginDto): Promise<User|null> {
    const user = await this.authRepository.findOne({ where: { email: LoginDto.email} });
    if (user && await argon2.verify(user.password, LoginDto.password)) {
      return user;
    }
    return null;
  }
}
```
We are using the User entity in our server so we need to add it to our auth.module.ts imports
```ts
imports: [TypeOrmModule.forFeature([User])],
```
#### The Auth Controller
First we use the `Guest` guard to make sure logged in user can^t access this controller.after that we create our methods
- ``POST register`` for registring user
- ``POST login`` for login user in
```ts 
import { Controller, Post, Body, Req,Res,UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto,LoginDto } from '../users/dto/create-user.dto';
import type { FastifyRequest,FastifyReply } from 'fastify';
import type { Session } from '@fastify/secure-session'
import { File } from 'src/parameter_decorators/parameter.decorator.file'
import { Fields } from 'src/parameter_decorators/parameter.decorator.fields'
import type { MultipartFile} from '@fastify/multipart';
import {Guest} from 'src/guard/authorization.guard'
@Controller('api')
@UseGuards(Guest)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@File() file:MultipartFile,@Fields() fields:CreateUserDto,@Res() res:FastifyReply) {
    const filename:string = await this.authService.uploadAvatar(file);
    fields.avatar = filename
    await this.authService.register(fields);
    return res.status(201).send({ message: 'Registred' });
  }
  
  @Post('login')
  async create(@Body() loginDto: LoginDto, @Req() req: FastifyRequest,@Res() res:FastifyReply) { 
    const user = await this.authService.login(loginDto);
    if(!user){
    return res.status(401).send({ message: 'Invalid credentials' });
    }
    (req.session as any).set("userId",String(user.id) );
    return res.status(201).send({ message: 'logged in' });
  }
  
}
```
We can see instead of rendring templates, we using `send` to send JSON object as response to the request.
#### The User Service
We create the User service, we will need three methods.
- ``findOne``: select and return using his id
- ``updateUser``: update user information
- ``updatePassword`` update user password
```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,UpdateResult } from 'typeorm';
import { AuthService} from '../auth/auth.service';
import { UpdateUserDto,UpdatePasswordDto } from './dto/update-user.dto';
import { User } from '../users/entities/user.entity';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
   constructor(
      @InjectRepository(User) 
      private userRepository: Repository<User>,
    ) {}

  async findOne(id: number): Promise<User|null>{
    return this.userRepository.findOne({ where: { id } });
  }
 
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return this.userRepository.update(id, updateUserDto);
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<UpdateResult> {
    updatePasswordDto.password = await argon2.hash(updatePasswordDto.password || '');
    return this.userRepository.update(id, updatePasswordDto);
  }
}
```
#### The User Controller
Firstly we use the `Authorized` to make sure only logged in users can access and manage their accounts. After that we define three routes.
- ``Get user`` return logged in user data.
- ``Put user`` update the logged in user data.
- ``Patch user/password`` update the logged in user password.
- `````
```ts
import { Controller, Get, Put, Body, Patch, UseGuards,Res,Req} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto,UpdatePasswordDto } from './dto/update-user.dto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import {AuthService } from 'src/auth/auth.service';
import { File } from 'src/parameter_decorators/parameter.decorator.file'
import { Fields } from 'src/parameter_decorators/parameter.decorator.fields'
import {Authorized} from 'src/guard/authorization.guard'

@Controller('api')
@UseGuards(Authorized)
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly authService: AuthService ) {}

  
  @Get('user')
  async findOne(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const userSession = parseInt(req.session.get("userId"));
    const user = await this.usersService.findOne(userSession);
    if(!user){
        return reply.status(404).send({ message: 'User not found' });
    }
    return reply.status(201).send(
            {id: user.id,username: user.username,email: user.email,avatar: 'static/avatars/' + user.avatar,});
  }

  @Put('user')
  async updateUser(@File() file,@Fields() fields:UpdateUserDto,@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const userSession = parseInt(req.session.get("userId"));
    if(file !== null){
      fields.avatar = await this.authService.uploadAvatar(file);
    }
    await  this.usersService.updateUser(userSession,fields);
    return reply.status(201).send({ message: 'User profile updated successfully' });
  }

  @Patch('user/password')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto,@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const userSession = parseInt(req.session.get("id"));
    await this.usersService.updatePassword(userSession, updatePasswordDto);
    return reply.status(201).send({ message: 'Password updated successfully' });
  }
}
```
In our controller we are using the `AuthService` so we need to add it to our ``users.module.ts`` providers.

```ts
import { AuthService } from 'src/auth/auth.service'; // we add this to the import
// and inside Module decorator
providers: [UsersService,AuthService ] // we add AuthService 
```
#### The Task Service
In the task service we need four methods.
- ``create`` create task record
- ``findAll`` return all task that belong to user
- ``update`` update state of a task
- ``remove`` delete a task from the record
```ts
import { Injectable } from '@nestjs/common';
import { CreateTaskDto} from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,UpdateResult } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TaskService {
   constructor(
      @InjectRepository(Task) 
      private taskRepository: Repository<Task>,
      @InjectRepository(User) 
      private userRepository: Repository<User>
    ) {}
    
  async create(id:number, name: string): Promise<Task|null> {
    const user = await this.userRepository.findOneBy({ id });
    if(!user){
      return  null
    }
    const newTask = await this.taskRepository.create({name:name,user});
    return this.taskRepository.save(newTask );
  }

  async findAll(userId: number): Promise<Task[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    return this.taskRepository.find({ where: { user } });
    }

  async update(taskId: number, userId: number, updateTaskDto: UpdateTaskDto) {
  const result = await this.taskRepository.update({ id: taskId, user: { id: userId } },updateTaskDto);
  if (result.affected === 0) {
    throw new Error('Task not found or access denied');
  }
  return result;
}

  async remove(taskId: number, userId: number) {
  const result = await this.taskRepository.delete({id: taskId,user: { id: userId },});
  if (result.affected === 0) {
    throw new Error('Task not found or access denied');
  }
}
}
```
We using the User entity so we need to add it to the ``task.module.ts`` import.
```ts
// inside module decortor we add
imports: [TypeOrmModule.forFeature([Task]),TypeOrmModule.forFeature([User])],  // add TypeOrmModule.forFeature([Task])
```
#### The Task Controller
Finally we create the task controller. it will be protected by the `Authorized` guard, it will have the following routes.
- `Get tasks` return all tasks that belong to the logged in user
- `Post tasks` create new task
- `Put tasks/:id'` update task state
- `Delete tasks/:id'` delete task from the record
```ts
import { Controller, Get, Post, Body,Put ,Param, Delete,Req,Res,UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import type { FastifyRequest,FastifyReply } from 'fastify';
import { Authorized } from 'src/guard/authorization.guard'

@Controller('api')
@UseGuards(Authorized)

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('tasks')
  async findAll(@Req() req: FastifyRequest,@Res() reply: FastifyReply) {
    const userSession = parseInt(req.session.get("userId"));
    const tasks = await this.taskService.findAll(userSession);
    return reply.status(201).send(tasks.map(task => ({
        id: task.id,
        name: task.name,
        state: task.state,
        createdAt: task.created_at,
      }))
    )
 
  }
  @Post('tasks')
  async create(@Body() createTaskDto: CreateTaskDto,@Req() req: FastifyRequest,@Res() reply: FastifyReply) {
      const userSession = parseInt(req.session.get("userId"));
      const newTask = await this.taskService.create(userSession,createTaskDto.name);
      if(!newTask){
        return reply.status(401).send({ message: "Couldn't Create task" })
      }
     return reply.status(201).send({ message: 'Task created successfully' })
  }
  

  @Put('tasks/:id')
  async update(@Param('id') id: number, @Body() updateTaskDto: UpdateTaskDto,@Res() reply: FastifyReply) {
    const userSession = parseInt(req.session.get("userId"));
    this.taskService.update(id, userSession, updateTaskDto);
    return reply.status(201).send({ message: 'Task updated successfully' })
  }

  @Delete('tasks/:id')
  async remove(@Param('id') id: number,@Res() reply: FastifyReply) {
    const userSession = parseInt(req.session.get("userId"));
    this.taskService.remove(id, userSession);
    return reply.status(201).send({ message: 'Task deleted successfully' })
  }
}
```
### Configuring The App
Finally we configure our `main.ts` file, we set nestjs on the Fastify Adaptater, we set the validator pip and we register all our plugins.
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as handlebars from 'handlebars';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.register(require('@fastify/view'), {
    engine: {
      handlebars: handlebars,
    },
    templates: join(__dirname, '..', 'views'), 
  });

  await app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });
  await app.register(require('@fastify/static'), {
	root: join(__dirname, '..', 'public'), 
	prefix: '/static/', 
  });
  require('dotenv').config();
  await app.register(require('@fastify/cookie'))
  await app.register(require('@fastify/secure-session'), {
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: false,       
      httpOnly: true,      
      sameSite: 'lax',     
      maxAge: 15 * 60 * 1000 
    },
    saveUninitialized: false,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```
### Creating The Interface
Now that our API is fully functional, we need a user interface to interact with it. Instead of the server rendering HTML pages for every route, we will serve a single HTML file (Single Page Application approach) and use JavaScript to fetch data from our API and update the DOM dynamically.
#### Serving the Entry Point
We need to update our `app.controller` to serve the `index.html` file when a user visits the root URL.

**`app.controller.ts`**
```ts
import { Controller, Get,Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  index(){
   
  }
}

```
Now, when you visit `http://127.0.0.1:3000/`, NestJs will serve the HTML file, and the rest of the application interaction will happen via JavaScript calling our API endpoints.
#### The HTML and CSS
We created a simple interface with two main sections: a Login section and a Dashboard section. Initially, the dashboard is hidden. After the user successfully logs in, the login section will be hidden, and the dashboard will be displayed.

We can find the HTML template and styling files inside the ``materials`` folder. The ``index.html`` file should be moved to the ``views`` folder and the ``style.css`` file should be moved to the ``public/css`` folder.
#### Client-Side Logic (JavaScript)
This is the most important part. The JavaScript file acts as the bridge between HTML events (such as clicks) and the Express REST API.

The code listens for form submissions and button clicks, then makes API calls using fetch to the corresponding endpoints. For example, when a user logs in, it sends a POST request to ``/api/login``, stores the session, and updates the view to display the user’s tasks. Similarly, task actions like creating, updating, or deleting a task are sent to the ``/api/tasks`` endpoints, and the page updates dynamically without reloading.

Helper functions handle view switching, displaying messages, and ensuring that only logged-in users can access protected sections.

The file is currently in the ``materials`` folder. We should move it  to the ``public/js`` folder so it can be served as a static asset by NestJs.
### Token-Based Authentication 
In the current Task Manager API, we use Secure-Session to manage authentication. This approach is effective for traditional web applications where the server and client are closely tied, and the browser handles session cookies automatically.  
However, modern APIs often require authentication that is stateless and can be easily used by various clients (mobile apps, other servers, JavaScript frontends). This is where Token-Based Authentication comes in.
#### How Tokens Work
Instead of the server storing session data for every user (stateful), the server issues a secure, self-contained token (like a JSON Web Token or JWT) upon successful login.
1. **Client Logs In:** The user sends credentials (username/password) to the `/api/login` endpoint.
2. **Server Generates Token:** If successful, the server creates a unique token containing the user's ID, expiration time, and a secure signature. The token is returned in the response.
3. **Client Stores Token:** The frontend (e.g., JavaScript) stores this token (usually in local storage).
4. **API Access:** For every subsequent request to protected endpoints (e.g., `/api/tasks`), the client includes this token in the `Authorization` header, typically prefixed with `Bearer`.
5. **Server Verification:** The server receives the request, verifies the token's signature, extracts the user ID, and grants access. No database lookup for a session is required, making the API stateless and faster.
### Implementing Token Authentication with NestJs
We use the `@nestjs/jwt` and ``@nestjs/passport`` to impliment the Token Authentication.

First, we install it using:
```shell
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
```
#### Setting the JWT Token
We set the auth module to apply the JWT Authentication. and we add `JwtStrategy` to our providers
```ts
// we add this to the import
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
require('dotenv').config(); // load env variable
// And inside Module decorator imports we add 
imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),// other imports
  ], 

providers: [AuthService,JwtStrategy],
```
- secret is used to sign and verify JWT tokens
- expiresIn defines token lifetime
#### Creating the JWT Strategy
After that we create The JWT Streategy,it is responsible for verifying incoming tokens.  
**``auth\jwt.strategy.ts``**
```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
```
This Strategy extract the token from the ``Authorization`` header,verify it then the decoded payload is attached to `request.user`.
#### Editing The Guard 
Now we not using session we need to edit our guards to apply the JWT Authentication
```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Authorized  extends AuthGuard('jwt') {}
```
We now need only one guard, the Authorized it extand the `AuthGuard` and implement the `jwt`. we remove the guard from the `auth.controller`.
#### Editing the Controller
Finally we need to edit our controllers, we start by editing the login controller instead of saving userId in session, we generat and return token.
```ts
import { Controller, Post, Body, Req,Res,UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto,LoginDto } from '../users/dto/create-user.dto';
import type { FastifyRequest,FastifyReply } from 'fastify';
import { File } from 'src/parameter_decorators/parameter.decorator.file'
import { Fields } from 'src/parameter_decorators/parameter.decorator.fields'
import type { MultipartFile} from '@fastify/multipart';
import { JwtService } from '@nestjs/jwt';
@Controller('api')

export class AuthController {
  constructor(private readonly authService: AuthService,
    private jwtService: JwtService
  ) {}
  @Post('register')
  async register(@File() file:MultipartFile,@Fields() fields:CreateUserDto,@Res() res:FastifyReply) {
    const filename:string = await this.authService.uploadAvatar(file);
    fields.avatar = filename
    await this.authService.register(fields);
    return res.status(201).send({ message: 'Registred' });
  }
  @Post('login')
  async create(@Body() loginDto: LoginDto, @Req() req: FastifyRequest,@Res() res:FastifyReply) { 
    const user = await this.authService.login(loginDto);
    if(!user){
    return res.status(401).send({ message: 'Invalid credentials' });
    }
    const payload = {
      userId:user.id,
      email:user.email
    }
    return res.status(201).send({ message: 'logged in' ,access_token:this.jwtService.sign(payload)});
  } 
}
```
We import `JwtService` add it to our ``AuthController``, then generate the token using the `sing` method.
Finally we edit our tasks and users controller we replace `req.session.get("userId")` with `req.user.userId`. We Also remove the `FastifyRequest` type from the `@Req() req`.
#### Editing the Javascript
Now we update our JavaScript to work with JWT authentication. When a user logs in, the backend returns a token, which we store in the browser using:
```javascript
localStorage.setItem('token', data.access_token);
```
For every subsequent API request, we need to include this token in the **Authorization header** so the backend can verify the user. This is done by adding:
```js
'Authorization': `Bearer ${localStorage.getItem('token')}` 
```
to the headers of each `fetch` request. This ensures that only authenticated users can access protected endpoints.
### API Rate Limiting
As our API gains more users, we need to protect it from abuse, excessive load, and denial-of-service (DoS) attacks. Rate Limiting is the practice of restricting the number of API requests a user (or IP address) can make within a specific time window.

#### Implementing Rate Limiting
To protect our NestJs application from abuse and excessive requests, we implement rate limiting. Rate limiting helps prevent brute-force attacks, reduces server load, and improves overall API reliability.  
In NestJs, the most common and recommended solution is the **`@nestjs/throttler`**,We start by installing it using:
```
npm install @nestjs/throttler
```
#### Installing Redis
Redis (Remote Dictionary Server) is a very fast, in-memory data store. It is commonly used for caching, sessions, queues, and rate limiting. Because Redis stores data in memory, it is significantly faster than traditional databases, making it ideal for tracking API requests in real time.  
Redis is used with rate limiting plugin to persist rate-limit data. This allows rate limits to remain consistent even if the server restarts or runs across multiple instances.  
We install it as following

- Ubuntu / Debian:

```
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

- macOS (Homebrew):

```
brew install redis
brew services start redis
```

- Windows Redis is not officially supported on Windows, but we can use **Redis for Windows** provided by the community [Redis for Windows](https://github.com/tporadowski/redis/releases).

After that we install the redis package
```
npm install  @nest-lab/throttler-storage-redis ioredis
```
#### Create Redis Client
Now we need to create a Redis connection. 
**`src/redis/redis.client.ts`** 
```ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});
```
#### Configure Throttler with Redis Storage
After creating our redis client, we update ``app.module.ts`` to use  Throttler with redis as storage
```ts
// we add this to the import
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import {redis } from 'src/redis/redis.client'

@Module({
  imports: [
     ThrottlerModule.forRoot({
      throttlers:[{
      ttl: 60,
      limit: 100,
    }],
    storage: new ThrottlerStorageRedisService(redis) // setting storage to redis
    }),// other imports
  ], 
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },// other providers
  ],
})
export class AppModule {}
```
- ttl: 60000  time window in mini seconds here we set it to 60000 which mean one minute.
- limit: 100 mean max 10 requests per minute per IP.
- storage: we set it to the `ThrottlerStorageRedisService(redis)`
### Ovverride The Rate Limit
The configuration will work globally, all our routes will have rate limit of 10 request per second, we can override this, in our controllers for example we can use `@SkipThrottle()` Decorator to skip and don't apply the rate limit for specific route or controller. we can also use `@Throttle(100, 1000)` Decorator to overwrite the rate limit for specific one.  
Example lets make the main route `/` skip the rate limit
```ts
import { Controller, Get,Render } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @Render('index')
  index(){
  }
}
```
Now the rate limit wont work on this Controller.  
### Query Parameters and Pagination in NestJS
#### Query Parameters
Sometimes we need to apply filters to our data.  
For example, allowing the user to search for tasks by name.  
In NestJS, this is done using query parameters, which are accessed inside controller methods using the @Query() decorator.  
```js
@Get('tasks')
findTasks(@Query('name') name: string) {
  // name contains the value of ?name=...
}
```
If the request URL is:
```
GET /tasks?name=study
```
Then the name parameter will have the value "study", Query parameters are commonly used for filtering, searching, sorting, and pagination.  
Wecan also retrieve all query parameters at once:
```js
@Get('tasks')
findTasks(@Query() query: any) {
  // query.name, query.page, query.limit, ...
}
```
#### Pagination
Pagination is the process of dividing data into chunks instead of returning all records at once.  This improves performance and makes APIs easier to consume.  
For example, instead of returning all tasks, we return 10 tasks per request, and the client can load more by navigating between pages.   
NestJS we implement pagination manually or with the help of TypeORM.  
#### Limit–Offset Pagination  
The most common pagination style is limit–offset pagination, where we send an offset that specifies where to start retrieving data, and a limit that specifies how many records to return.    
Example request:
```
GET /tasks?limit=10&offset=20
```
In the controller, we retrieve these query parameter values:
```js
@Get('tasks')
findTasks(
  @Query('limit') limit = 10,
  @Query('offset') offset = 0,
) {
  return this.tasksService.findWithOffset(offset, limit);
}
```
Then, in the service, we use these values as follows:
```js
const [results, count] = await this.taskRepository.findAndCount({skip: offset,take: limit,});
```
#### Page Number Pagination
When working with large databases, the offset value can quickly become very large, which may negatively affect performance. To address this, we can use a cleaner and more structured pagination approach called page-based pagination, where we use page and limit query parameters.   
Example request:
```
GET /tasks?page=1&limit=10
```
The controller receives these query parameters
```js
@Get('tasks')
findTasks(
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  const skip = (page - 1) * limit;
}
```
Here, we use page and limit to calculate how many records TypeORM should skip when retrieving data.  
Each page contains 10 elements:
- For the first page, we skip 0 records and retrieve the first 10.
- For the second page, we skip 10 records and retrieve the next 10.
- For the third page, we skip 20 records, and so on.

Finally we update our service to apply this logic:
```js
const [results, count] = await this.taskRepository.findAndCount({ skip, take: limit, });
``` 
