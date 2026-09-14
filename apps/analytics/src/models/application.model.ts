import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';

/** JSONB configuration stored on the integrated application row. */
export type ApplicationSetting = Record<string, unknown>;

/** Active application row returned from the database. */
export type Application = BaseEntity & {
  uuid: string;
  secretKey: string;
  code: string;
  name: string;
  setting: ApplicationSetting;
};

/** Application attached to the request after middleware validation. */
export type ApplicationContext = Omit<Application, 'secretKey'>;

const TABLE = 'application';
const table = initModel(TABLE);

/**
 * Finds an active (non-deleted) application by uuid and secret key.
 *
 * @example
 * findActiveApplication(uuid, secretKey).then((app) => app);
 */
export const findActiveApplication = (
  uuid: string,
  secretKey: string,
): Promise<Application | undefined> => table()
  .select('id', 'uuid', 'name', 'code')
  .where({ uuid, secretKey })
  .whereNull('deleted_at')
  .first();

export const findByCode = (appCode: string) => table()
  .active()
  .where({ code: appCode })
  .first();
