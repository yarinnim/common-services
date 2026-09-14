import { type Route } from 'xpref';
import { getAction } from './device-online.controller';

export default {
  '/device-online': ['device-online', [], {
    get: getAction,
  }],
} as Route;
