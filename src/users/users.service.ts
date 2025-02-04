import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/roles/roles.entity';
import { RolesService } from 'src/roles/roles.service';
import { RequestWithUser } from 'src/auth/auth.guard';
import { UsernameTakenException } from 'src/exceptions/username-taken.expcetion';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rolesService: RolesService,
  ) {}

  async create(userDto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(userDto.password, this.saltRounds);

    const userRole = await this.rolesService.findOne(Roles.User);

    let user = await this.usersRepository.create({
      ...userDto,
      password: passwordHash,
      roles: [userRole],
    });
    try {
      user = await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        console.log(error.driverError.detail);
        if (error.driverError.detail.includes('email')) {
          throw new UsernameTakenException('Email already in use');
        } else {
          throw new UsernameTakenException('Username is already taken');
        }
      }
    }

    return user;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  findById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async comparePassword(
    plainPass: string,
    hashedPass: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPass, hashedPass);
  }

  checkForResourceOwner(id: string, req: RequestWithUser): boolean {
    const { user } = req;
    if (user.sub !== id && !user.roles.includes(Roles.Admin)) {
      return false;
    }
    return true;
  }
}
