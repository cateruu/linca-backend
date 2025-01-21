import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
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
      throw new UnauthorizedException('invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);

    return {
      token: await this.jwtService.signAsync(payload),
      expiryDate: expiry.toISOString(),
    };
  }

  async signUp(newUser: CreateUserDto): Promise<JwtResponse> {
    const plainPassword = newUser.password;
    const user = await this.userService.create(newUser);

    return await this.signIn(user.username, plainPassword);
  }
}
