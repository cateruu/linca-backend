import { DataType, newDb } from 'pg-mem';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

export const setupDataSource = async () => {
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  });

  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database',
  });

  db.public.interceptQueries((queryText) => {
    if (queryText.search(/(pg_views|pg_matviews|pg_tables|pg_enum)/g) > -1) {
      return [];
    }
    return null;
  });

  db.public.registerFunction({
    implementation: () => '16',
    name: 'version',
  });

  db.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: v4,
      impure: true,
    });
  });

  const ds: DataSource = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
  });
  await ds.initialize();
  await ds.synchronize();

  return ds;
};
