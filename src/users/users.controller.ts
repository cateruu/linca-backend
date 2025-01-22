import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService as UsersService } from './users.service';
import { User } from './users.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
