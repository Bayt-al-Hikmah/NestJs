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