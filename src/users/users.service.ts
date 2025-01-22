import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/roles/roles.entity';
import { RolesService } from 'src/roles/roles.service';
import { RequestWithUser } from 'src/auth/auth.guard';

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

    const user = await this.usersRepository.create({
      ...userDto,
      password: passwordHash,
      roles: [userRole],
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
