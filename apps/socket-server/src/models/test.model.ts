import { initModel } from './pool';

const tableName = 'test_table';
const table = initModel(tableName);

export default table;

export function find(id: number) {
  return table()
    .select('*')
    .find(id);
}
