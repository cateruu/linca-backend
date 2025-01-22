import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/singInDto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtResponse } from './dto/jwtResponse';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  signIn(@Body() signInDto: SignInDto): Promise<JwtResponse> {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('/register')
  signUp(@Body() signUpDto: CreateUserDto): Promise<JwtResponse> {
    return this.authService.signUp(signUpDto);
  }
}
