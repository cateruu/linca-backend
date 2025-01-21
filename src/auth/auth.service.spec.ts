import { TestingModule } from '@nestjs/testing';
import { setupDataSource } from 'src/test-utils/setup';
import { buildTestModule } from 'src/test-utils/test-module';
import { DataSource } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

describe('AuthService', () => {
  let dataSource: DataSource;
  let moduleRef: TestingModule;
  let authService: AuthService;
  let usersService: UsersService;

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
    moduleRef = await buildTestModule(dataSource);
    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM users');
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    beforeEach(async () => {
      await usersService.create(users[0]);
    });

    afterEach(async () => {
      await dataSource.query('DELETE FROM users');
    });

    it('should sign in user and return JWT token', async () => {
      expect(
        await authService.signIn(users[0].username, users[0].password),
      ).toMatchObject({
        token: expect.any(String),
        expiryDate: expect.any(String),
      });
    });

    it('should return "user not found" error', () => {
      expect(
        authService.signIn(users[1].username, users[1].password),
      ).rejects.toThrow('user not found');
    });

    it('should return unathorized error', () => {
      expect(authService.signIn(users[0].username, '1234567')).rejects.toThrow(
        'invalid credentials',
      );
    });

    it('expiryDate should be set for 1 day', async () => {
      const resp = await authService.signIn(
        users[0].username,
        users[0].password,
      );

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1);
      expect(new Date(resp.expiryDate).getDay()).toBe(expiry.getDay());
    });
  });

  describe('signUp', () => {
    afterEach(async () => {
      dataSource.query('DELETE FROM users');
    });

    it('should create new user', async () => {
      await authService.signUp(users[0]);

      expect(await usersService.findOne(users[0].username)).toMatchObject({
        id: expect.any(String),
        username: users[0].username,
        email: users[0].email,
        password: expect.any(String),
      });
    });

    it('should create user and sign in him after returning JWT token', async () => {
      expect(await authService.signUp(users[0])).toMatchObject({
        token: expect.any(String),
        expiryDate: expect.any(String),
      });
    });
  });
});
