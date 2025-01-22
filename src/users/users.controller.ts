import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService as UsersService } from './users.service';
import { User } from './users.entity';
import { AuthGuard, RequestWithUser } from 'src/auth/auth.guard';
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

  @Get('/:id')
  @UseGuards(AuthGuard)
  async getById(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<User> {
    let foundUser: User;
    try {
      const isOwner = this.usersService.checkForResourceOwner(id, req);
      if (!isOwner) {
        throw new NotFoundException();
      }

      foundUser = await this.usersService.findById(id);
    } catch {
      throw new NotFoundException('user with given ID do not exist.');
    }

    return foundUser;
  }
}
