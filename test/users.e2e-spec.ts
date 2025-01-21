import { INestApplication } from '@nestjs/common';
import { setupDataSource } from 'src/test-utils/setup';
import { buildTestModule } from 'src/test-utils/test-module';
import { UsersService } from 'src/users/users.service';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let dataSource: DataSource;

  const users = [
    {
      username: 'test',
      email: 'test@test.com',
      password: '123456',
    },
    {
      username: 'test2',
      email: 'test2@test2.com',
      password: '123456',
    },
  ];

  beforeAll(async () => {
    dataSource = await setupDataSource();
    const moduleRef = await buildTestModule(dataSource);

    usersService = moduleRef.get(UsersService);
    app = moduleRef.createNestApplication();
    app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM users');
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      for (const user of users) {
        await usersService.create(user);
      }
    });

    it('should return users array', async () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });
});
