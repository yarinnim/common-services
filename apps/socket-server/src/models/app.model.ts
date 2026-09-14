import { initModel } from './pool';

const TABLE_NAME = 'app';
const table = initModel(TABLE_NAME);

export default table;

const query = (cond: any = {}) => table()
  .select('app.id', 'app.uuid', 'app.secret_key', 'app.name')
  .whereNull('app.deleted_at')
  .whereRaw('(app.expired_at is null or app.expired_at >= current_timestamp)')
  .where(cond);

export function find(id: number) {
  return query().find(id);
}

export function getApp(namespaceId: string, appId: string, secretKey: string) {
  return query({
    'namespace.uuid': namespaceId,
    'app.uuid': appId,
    'app.secret_key': secretKey,
  })
    .innerJoin('namespace', 'namespace.id', 'app.namespace_id')
    .first();
}
