import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './roles.entity';
import { Repository } from 'typeorm';

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
      await this.rolesRepository.save({ name: 'user' });
      await this.rolesRepository.save({ name: 'admin' });
    }
  }
}
