/* eslint-disable no-console */
import { decrypt } from './crypto';

const str = [
  '2ab60bbd116e7418c8e7da3fad076e3909d1537c11a164387c336b79734e2d95',
  'a0c4d9e53f1d33c120f63a40b4a66fd11df0478a5e31b9cc28cb792d0587bdaa',
  '48c1b0d119dbcb520940f65426047b1d18748aadc8809a13201d7da1d55e5bb9',
  '9b44544896b8287a69d3ac35110fb054043d8372efdfe16e9ccabc5a6fcd2138',
  '9c75f572a5b5867515e4cd23adb72764',
].join('');
const base64string = decrypt(str);
const buf = Buffer.from(base64string, 'base64');
console.log(JSON.parse(buf.toString()));
