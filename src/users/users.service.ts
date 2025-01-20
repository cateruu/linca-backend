import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userDto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(userDto.password, this.saltRounds);

    const user = await this.usersRepository.create({
      ...userDto,
      password: passwordHash,
    });
    try {
      const result = await this.usersRepository.insert(user);
      user.id = result.identifiers[0].id;
    } catch {
      throw new BadRequestException('user already exists');
    }

    return user;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async comparePassword(
    plainPass: string,
    hashedPass: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPass, hashedPass);
  }
}
