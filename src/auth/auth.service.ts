import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtResponse } from './dto/jwtResponse';
import { RolesService } from 'src/roles/roles.service';
import { User } from 'src/users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private rolesService: RolesService,
  ) {}

  async signIn(username: string, password: string): Promise<JwtResponse> {
    const user = await this.userService.findOne(username);

    if (!user) {
      throw new NotFoundException('user not found.');
    }

    const roles = await this.rolesService.findForUser(user);
    user.roles = roles;

    if (!(await this.userService.comparePassword(password, user.password))) {
      throw new UnauthorizedException('invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles.map((role) => role.name),
    };
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);

    return {
      token: await this.jwtService.signAsync(payload),
      expiryDate: expiry,
    };
  }

  async signUp(newUser: CreateUserDto): Promise<JwtResponse> {
    const plainPassword = newUser.password;
    const user = await this.userService.create(newUser);

    return await this.signIn(user.username, plainPassword);
  }

  async verifyToken(token: string): Promise<User> {
    const data = this.jwtService.decode(token);

    if (!data) {
      throw new UnauthorizedException('invalid JWT token');
    }

    const user = await this.userService.findOne(data.username);
    if (!user) {
      throw new UnauthorizedException('invalid JWT token');
    }

    const roles = await this.rolesService.findForUser(user);

    user.roles = roles;
    return user;
  }
}
