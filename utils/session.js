import * as crypto from './crypto.js';
import * as handler from './handler.js';
import Session from '../models/session.js';
import { config } from '../config.js';

// Creates new session
export async function create(res, data={}, exp=config.session.exp) {
  let sid = crypto.random(config.session.len);
  
  handler.cookie(res, 'sid', sid, exp, {
    httpOnly: true,
    sameSite: config.cookie.sameSite,
    secure: config.cookie.secure
  });

  const ses = new Session({
    id: sid,
    expiration: Date.now() + Number(exp),
    data: data
  });
  await ses.save();

  return sid;
}

// Deletes the existing session (if it exists) and establishes a new one
export async function refresh(req, res, data={}, exp=config.session.exp) {
  if (req.cookies.sid != undefined) {
    let sid = req.cookies.sid;
    Session.findOneAndDelete({ id: sid });
    res.clearCookie(sid);
  }

  return await create(res, data, exp);
}

// Returns session data if it exists, null otherwise
export async function get(sid) {
  let ses = await Session.findOne({ id: sid });
  if (!ses) return null;
  return ses.data;
}

// Stores data in session if it exists, creates new one with the data otherise
export async function set(sid, res, data, exp=config.session.exp) {
  let ses = await Session.findOne({ id: sid });

  if (!ses) {
    return await create(res, data, exp);
  }

  if (ses.data) Object.assign(ses.data, data);
  else ses.data = data;

  ses.markModified('data');
  await ses.save();
  
  return sid;
}

// Deletes all Session documents with past expirations
export async function expireMany() {
  await Session.deleteMany({ expiration : {$lte: Date.now()} });
}
