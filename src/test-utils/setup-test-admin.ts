import { Role, Roles } from 'src/roles/roles.entity';
import { User } from 'src/users/users.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export const setupTestAdmin = async (dataSource: DataSource) => {
  const rolesRepository = dataSource.getRepository(Role);
  const adminRole = await rolesRepository.save({ name: Roles.Admin });
  const userRespository = dataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminUser = userRespository.create({
    email: 'admin@admin.com',
    username: 'admin',
    password: hashedPassword,
    roles: [adminRole],
  });
  await userRespository.save(adminUser);
};
