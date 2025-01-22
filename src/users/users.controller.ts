import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService as UsersService } from './users.service';
import { User } from './users.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleAccess } from 'src/roles/roles.decorator';
import { Roles } from 'src/roles/roles.entity';
import { RoleGuard } from 'src/roles/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RoleAccess(Roles.Admin)
  @UseGuards(AuthGuard, RoleGuard)
  async getAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
