import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Entity()
export class ChatChannel extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'text' })
  unique_name: string;

  @Column({ type: 'text' })
  twilio_sid: string;

  @Column({ type: 'text' })
  type: 'therapist' | 'support';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToMany(type => User, user => user.channels)
  users: User[];

}
