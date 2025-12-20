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