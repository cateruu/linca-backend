import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupDataSource } from 'src/test-utils/setup';
import { buildTestModule } from 'src/test-utils/test-module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const dataSource = await setupDataSource();
    const moduleRef = await buildTestModule(dataSource);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('alo');
  });
});
