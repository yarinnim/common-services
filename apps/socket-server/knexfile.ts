import getKnex from 'knexify/knexfile';
import { connection } from './src/models/pool';

export default getKnex({ connection });
