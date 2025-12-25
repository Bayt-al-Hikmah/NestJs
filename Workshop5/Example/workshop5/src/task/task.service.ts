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

 
  async update(id: number,updateTaskDto: UpdateTaskDto ): Promise<UpdateResult>{
    return this.taskRepository.update(id, updateTaskDto);
  }

  async remove(id: number) {
     await this.taskRepository.delete(id);
  }
}
