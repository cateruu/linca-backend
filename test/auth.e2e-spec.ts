import { INestApplication } from '@nestjs/common';
import { setupDataSource } from 'src/test-utils/setup';
import { buildTestModule } from 'src/test-utils/test-module';
import { UsersService } from 'src/users/users.service';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService: UsersService;

  beforeAll(async () => {
    dataSource = await setupDataSource();
    const moduleRef = await buildTestModule(dataSource);

    usersService = moduleRef.get(UsersService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM users');
  });

  describe('POST /auth/login', () => {
    it('should login user', async () => {
      await usersService.create({
        email: 'test@test.com',
        password: '123456',
        username: 'test',
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test',
          password: '123456',
        })
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should throw invalid creedntials error', async () => {
      await usersService.create({
        email: 'test@test.com',
        password: '123456',
        username: 'test',
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: '1234567',
          username: 'test',
        })
        .expect(401)
        .expect('Content-Type', /json/);
    });

    it('should throw user not found error', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test1@test1.com',
          password: '123456',
          username: 'test2',
        })
        .expect(404)
        .expect('Content-Type', /json/);
    });
  });

  describe('POST /auth/register', () => {
    it('should register and login user', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: '123456',
          username: 'test',
        })
        .expect(201)
        .expect('Content-Type', /json/);
    });

    it('should throw duplicate error', async () => {
      await usersService.create({
        email: 'test@test.com',
        password: '123456',
        username: 'test',
      });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: '123456',
          username: 'test',
        })
        .expect(400)
        .expect('Content-Type', /json/);
    });
  });
});
