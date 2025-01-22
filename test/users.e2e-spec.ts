import { INestApplication } from '@nestjs/common';
import { setupDataSource } from 'src/test-utils/setup';
import { buildTestModule } from 'src/test-utils/test-module';
import { UsersService } from 'src/users/users.service';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AuthService } from 'src/auth/auth.service';
import { setupTestAdmin } from 'src/test-utils/setup-test-admin';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let dataSource: DataSource;
  let authService: AuthService;

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
    authService = moduleRef.get(AuthService);
    app = moduleRef.createNestApplication();
    app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    for (const user of users) {
      await usersService.create(user);
    }
    await setupTestAdmin(dataSource);
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM users');
  });

  describe('GET /users', () => {
    it('should return users array for admin account', async () => {
      const token = await authService.signIn('admin', '123456');

      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token.token}`)
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should return unathorized for not logged in user', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401)
        .expect('Content-Type', /json/);
    });

    it('should return forbidden for not admin user', async () => {
      const token = await authService.signIn(
        users[0].username,
        users[0].password,
      );

      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token.token}`)
        .expect(403)
        .expect('Content-Type', /json/);
    });
  });

  describe('GET /users/:id', () => {
    it('should get user info', async () => {
      const user = await usersService.findOne(users[0].username);
      const token = await authService.signIn(
        users[0].username,
        users[0].password,
      );

      return request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should throw not found for wrong user', async () => {
      const admin = await usersService.findOne('admin');
      const token = await authService.signIn(
        users[0].username,
        users[0].password,
      );

      return request(app.getHttpServer())
        .get(`/users/${admin.id}`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(404)
        .expect('Content-Type', /json/);
    });

    it('should throw not found for non existent user', async () => {
      const token = await authService.signIn(
        users[0].username,
        users[0].password,
      );

      return request(app.getHttpServer())
        .get(`/users/123`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(404)
        .expect('Content-Type', /json/);
    });
  });
});
