import { Command, CommandRunner } from 'nest-commander';
import { Role, Roles } from 'src/roles/roles.entity';
import { User } from 'src/users/users.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
@Command({
  name: 'create:admin',
  description: 'create admin user',
})
export class CreateAdminCommand extends CommandRunner {
  constructor(private dataSource: DataSource) {
    super();
  }

  async run() {
    try {
      const usersRepository = this.dataSource.getRepository(User);
      const rolesRepository = this.dataSource.getRepository(Role);

      const isAdminAlreadyCreated = await usersRepository.findOne({
        where: { username: process.env.ADMIN_USERNAME },
      });

      if (isAdminAlreadyCreated) {
        console.log('admin already created');
        return;
      }

      let adminRole = await rolesRepository.findOne({
        where: { name: Roles.Admin },
      });
      let userRole = await rolesRepository.findOne({
        where: { name: Roles.User },
      });

      if (!adminRole) {
        adminRole = await rolesRepository.save({ name: Roles.Admin });
      }
      if (!userRole) {
        userRole = await rolesRepository.save({ name: Roles.User });
      }

      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      const admin = usersRepository.create({
        email: process.env.ADMIN_EMAIL,
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        roles: [adminRole, userRole],
      });
      console.log(admin);
      await usersRepository.save(admin);
    } catch {
      console.log('unable to create admin user');
      process.exit(1);
    }
  }
}
