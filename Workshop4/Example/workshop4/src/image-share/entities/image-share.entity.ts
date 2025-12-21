import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity()
export class ImageShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true})
  name: string;

  @Column({ unique: true})
  path: string;

}