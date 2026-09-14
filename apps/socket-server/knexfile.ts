import getKnex from '@core/db/knexfile';
import { connection } from './src/models/pool';

export default getKnex({ connection });
