import { UsersService } from './users.service';
import { buildTestModule } from 'src/test-utils/test-module';
import { setupDatabase, setupDataSource } from 'src/test-utils/setup';
import { DataSource } from 'typeorm';
import { IMemoryDb } from 'pg-mem';

describe('UsersService', () => {
  let db: IMemoryDb;
  let dataSource: DataSource;
  let moduleRef;
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
  let usersService: UsersService;

  beforeAll(async () => {
    db = setupDatabase();
    dataSource = await setupDataSource(db);
    moduleRef = await buildTestModule(dataSource);

    usersService = moduleRef.get(UsersService);
  });

  afterEach(async () => {
    db.public.query('DELETE FROM users');
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('findOne', () => {
    it('should return an user', async () => {
      await usersService.create(users[0]);

      expect(await usersService.findOne(users[0].username)).toEqual(users[0]);
    });

    it('should not return an user', async () => {
      await usersService.create(users[0]);
      expect(await usersService.findOne(users[1].username)).toEqual(null);
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      for (const user of users) {
        await usersService.create(user);
      }

      expect(await usersService.findAll()).toEqual(users);
    });
  });
});
