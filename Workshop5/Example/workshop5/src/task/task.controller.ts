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
    this.taskService.update(id, updateTaskDto);
    return reply.status(201).send({ message: 'Task updated successfully' })
  }

  @Delete('tasks/:id')
  async remove(@Param('id') id: number,@Res() reply: FastifyReply) {
    this.taskService.remove(id);
    return reply.status(201).send({ message: 'Task deleted successfully' })
  }
}
