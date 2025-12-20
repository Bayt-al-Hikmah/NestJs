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