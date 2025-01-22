import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateAdminCommand } from 'commands/create-admin.command';
import { Role } from 'src/roles/roles.entity';
import { User } from 'src/users/users.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Role],
      synchronize: process.env.DB_SYNCHRONIZE === 'true' ? true : false,
      logging: process.env.DB_LOGGING === 'true' ? true : false,
    }),
    TypeOrmModule.forFeature([User, Role]),
  ],
  providers: [CreateAdminCommand],
})
export class CliModule {}
