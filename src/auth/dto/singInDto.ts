import { MinLength } from 'class-validator';

export class SignInDto {
  @MinLength(1, { message: 'username has to be at least 1 character long.' })
  username: string;
  password: string;
}
