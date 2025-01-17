import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(2, { message: 'username has to be at least 2 characters long.' })
  @MaxLength(50, { message: 'username has to be at most 50 characters long.' })
  username: string;

  // lepsza walidacja hasla
  @MinLength(6, { message: 'password has to be at lest 6 characters long.' })
  @MaxLength(50, { message: 'password has to be at most 50 characters long.' })
  password: string;
}
