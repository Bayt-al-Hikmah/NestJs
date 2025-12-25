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
