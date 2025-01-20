import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';

let testModule: TestingModule;

export const buildTestModule = async (dataSource: DataSource) => {
  if (testModule) {
    return testModule;
  }

  testModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        name: 'default',
        synchronize: true,
      }),
      AppModule,
    ],
  })
    .overrideProvider(DataSource)
    .useValue(dataSource)
    .compile();

  return testModule;
};
