import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/singInDto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtResponse } from './dto/jwtResponse';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtResponse> {
    const resp = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
    res.cookie('jwt', resp.token, { expires: resp.expiryDate, httpOnly: true });
    return resp;
  }

  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  async signOut(@Res({ passthrough: true }) res: Response) {
    res.cookie('jwt', '', { expires: new Date(), httpOnly: true });
  }

  @Post('/register')
  async signUp(
    @Body() signUpDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtResponse> {
    const resp = await this.authService.signUp(signUpDto);
    res.cookie('jwt', resp.token, { expires: resp.expiryDate, httpOnly: true });
    return resp;
  }

  @Get('/verify')
  verifyToken(@Req() req: Request): Promise<any> {
    const token = req.cookies['jwt'];

    return this.authService.verifyToken(token);
  }
}
