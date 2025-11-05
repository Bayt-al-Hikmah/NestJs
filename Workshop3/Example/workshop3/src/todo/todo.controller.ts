import { UseGuards, Controller, Get, Post, Body, Render,Redirect, Res, HttpStatus,Request  } from '@nestjs/common';
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