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
  async findAll(@Req() req,@Res() reply: FastifyReply) {
    const userId = parseInt(req.user.userId);
    const tasks = await this.taskService.findAll(userId);
    return reply.status(201).send(tasks.map(task => ({
        id: task.id,
        name: task.name,
        state: task.state,
        createdAt: task.created_at,
      }))
    )
 
  }
  @Post('tasks')
  async create(@Body() createTaskDto: CreateTaskDto,@Req() req,@Res() reply: FastifyReply) {
      const userId = parseInt(req.user.userId);
      const newTask = await this.taskService.create(userId,createTaskDto.name);
      if(!newTask){
        return reply.status(401).send({ message: "Couldn't Create task" })
      }
     return reply.status(201).send({ message: 'Task created successfully' })
  }
  

  @Put('tasks/:id')
  async update(@Param('id') id: number, @Body() updateTaskDto: UpdateTaskDto,@Res() reply: FastifyReply) {
    const userId = parseInt(req.user.userId);
    this.taskService.update(id, userId, updateTaskDto);
    return reply.status(201).send({ message: 'Task updated successfully' })
  }

  @Delete('tasks/:id')
  async remove(@Param('id') id: number,@Res() reply: FastifyReply) {
    const userId = parseInt(req.user.userId);
    this.taskService.remove(id, userId);
    return reply.status(201).send({ message: 'Task deleted successfully' })
  }
}
