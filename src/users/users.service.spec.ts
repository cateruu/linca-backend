import { UsersService } from './users.service';
import { buildTestModule } from 'src/test-utils/test-module';
import { setupDataSource } from 'src/test-utils/setup';
import { DataSource } from 'typeorm';
import { TestingModule } from '@nestjs/testing';

describe('UsersService', () => {
  let dataSource: DataSource;
  let moduleRef: TestingModule;
  let usersService: UsersService;

  const users = [
    {
      email: 'test@test.com',
      username: 'test',
      password: '123456',
    },
    {
      email: 'test2@test2.com',
      username: 'test2',
      password: '123456',
    },
  ];

  beforeAll(async () => {
    dataSource = await setupDataSource();
    moduleRef = await buildTestModule(dataSource);
    usersService = moduleRef.get(UsersService);
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM users');
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an user', async () => {
      await usersService.create(users[0]);

      expect(await usersService.findOne(users[0].username)).toMatchObject({
        id: expect.any(String),
        username: users[0].username,
        email: users[0].email,
        password: expect.any(String),
      });
    });

    it('should not return an user', async () => {
      await usersService.create(users[0]);

      expect(await usersService.findOne(users[1].username)).toEqual(null);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      for (const user of users) {
        await usersService.create(user);
      }

      const foundUsers = await usersService.findAll();

      expect(foundUsers).toHaveLength(2);
      expect(foundUsers[0]).toMatchObject({
        id: expect.any(String),
        username: users[0].username,
        email: users[0].email,
        password: expect.any(String),
      });
    });
  });

  describe('findOne', () => {
    it('should get correct user', async () => {
      await usersService.create(users[0]);

      expect(await usersService.findOne(users[0].username)).toMatchObject({
        id: expect.any(String),
        username: users[0].username,
        email: users[0].email,
      });
    });

    it('should return null if no user found', async () => {
      await usersService.create(users[0]);

      expect(await usersService.findOne(users[1].username)).toBe(null);
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const user = await usersService.create(users[0]);

      expect(user).not.toBe(null);
      expect(user).toMatchObject({
        id: expect.any(String),
        username: expect.any(String),
        email: expect.any(String),
        password: expect.any(String),
      });
    });

    it('should throw duplicated error', async () => {
      await usersService.create(users[0]);
      expect(usersService.create(users[0])).rejects.toThrow();
    });
  });
});
