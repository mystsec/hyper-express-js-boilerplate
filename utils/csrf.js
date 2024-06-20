import * as crypto from './crypto.js';
import * as handler from './handler.js';
import { get as getSession, set as setSession } from './session.js';
import { config } from '../config.js';

// Generate csrf token, hash it, store in session
export async function generate(res, sid=null) {
  let rand = crypto.random(config.session.len);
  let hash = await crypto.digest(rand, 'SHA-512');

  handler.cookie(res, 'cid', rand, config.session.exp, {
    sameSite: config.cookie.sameSite,
    secure: config.cookie.secure
  });

  let set = await setSession(sid, res, {'csrf': hash});

  return {'csrf_token': rand, 'sid': set};
}

// Checks if a csrf token is valid
export async function verify(req) {
  let token = req.get('X-CSRF-Token');
  if (!token) return false;

  let hash = await crypto.digest(token, 'SHA-512');

  let sesData = await getSession(req.cookies.sid);
  if (!sesData) return false;

  let real = sesData.csrf;

  return crypto.ts_equals(real, hash);
}
