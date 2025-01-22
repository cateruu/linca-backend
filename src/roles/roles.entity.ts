import { User } from 'src/users/users.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Roles {
  User = 'user',
  Admin = 'admin',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: Roles;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
