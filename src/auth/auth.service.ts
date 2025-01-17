import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { JwtResponse } from './dto/jwtResponse';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<JwtResponse> {
    const user = await this.userService.findOne(username);

    if (!user) {
      throw new NotFoundException('user not found.');
    }

    if (!(await this.userService.comparePassword(password, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.username };

    return { token: await this.jwtService.signAsync(payload) };
  }

  async signUp(newUser: CreateUserDto): Promise<User> {
    const user = this.userService.create(newUser);

    // sign in user

    return user;
  }
}