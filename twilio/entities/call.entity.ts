import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany } from "typeorm";
import { User } from "src/user/entities/user.entity";

export enum StatusCall {
  STARTED = 1,
  IN_PROGRESS,
  ENDED,
  REJECTED,
  NOT_ANSWERED
}

@Entity()
export class VideoCall extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int' })
  status: StatusCall;

  @Column()
  room_id: string;

  @Column({ type: 'datetime', nullable: true })
  finished_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToMany(type => User, user => user.calls)
  users: User[];

}
