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