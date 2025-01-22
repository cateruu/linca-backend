import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, Roles } from './roles.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/users.entity';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    const result = await this.rolesRepository.query(
      'SELECT COUNT(*) FROM roles',
    );
    const count = result[0].count;
    if (count === '0') {
      await this.rolesRepository.save({ name: Roles.Admin });
      await this.rolesRepository.save({ name: Roles.User });
    }
  }

  async findOne(role: Roles): Promise<Role> {
    return this.rolesRepository.findOne({ where: { name: role } });
  }

  async findForUser(user: User): Promise<Role[]> {
    return this.rolesRepository.find({ where: { users: user } });
  }
}
