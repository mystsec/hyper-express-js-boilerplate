import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

import { config } from '../config.js';
import * as csrf from './csrf.js';

const __dirname = path.resolve(path.dirname(''));

global.info = {
  'status': 200,
  'err': null,
  'file': null
};

// Set global status for logging & response status
export function setStatus(res, status) {
  global.info.status = status;
  res.status(status);
}

// Modify global info
export function setInfo(field, value) {
  global.info[field] = value;
}

// Reset global info for logging
export function resetInfo() {
  global.info = {
    'status': 200,
    'err': null,
    'file': null
  };
}

// Serve corresponding error page
export function sendError(res) {
  let msg;

  switch(global.info.status) {
    case 403:
      msg = '403: Restricted area "\\_(^,^)_/"';
      break;
    case 404:
      msg = "404: Sorry can't find that :(";
      break;
    case 500:
      msg = "500: Something went wrong :(";
      break;
    default:
      msg = '"\\_(^,^)_/"';
  }

  res.send(msg);
}

// Render file with logging
export function render(res, file, data={}) {
  global.info.file = file;

  ejs.renderFile(path.join(__dirname, file), data, function(err, str) {
    if (err) throw new Error(err);
    res.type('html');
    res.send(str);
  });
}

// Log request
export function log(req, logIP = false) {
  console.log(`[${req.method}] ${global.info.status}:\n\tPath: ${req.url}`);
  if (logIP) {
    console.log(`\n\tIP: ${req.ip}/${req.proxy_ip}`);
  }
  if (global.info.file) {
    console.log(`\tFile: ${global.info.file}`);
  }
  if (global.info.err) {
    console.log(`\tError: ${global.info.err}`);
  }
  resetInfo();
}

// Wrapper to catch errors and enforce checks
export function wrap(operation, opts = "") {
  return async (req, res) => {
    try {
      let checks = true;

      if (!opts.includes("csrf_exempt")) {
        checks = checks && await csrfCheck(req, res);
      }
      // Add additional checks here

      if (checks)
        await operation(req, res);

      log(req);
    }
    catch (err) {
      setStatus(res, err.code ? err.code : 500);
      global.info.err = err.message + '\n\t' + err.stack;
      sendError(res);
      log(req);
    }
  };
}

// Verifies csrf token is valid, throws error otherise
async function csrfCheck(req, res) {
  let vf =  await csrf.verify(req);

  if (vf) {
    let csrf_token = await csrf.generate(res, req.cookies.sid);
  }
  else {
    setStatus(res, 403);
    global.info.err = "Forbidden: csrf check failed :(";
    sendError(res);
  }

  return vf;
}

// Checks if request uses an allowed host and protocol
export function checkHost(req, res, next) {
  let allowedHosts = config.hosts;
  let allowedProts = config.protocols;

  if (!allowedHosts.includes(req.get('host')) || ! allowedProts.includes(req.protocol)) {
    setStatus(res, 403);
    global.info.err = "Invalid host or protocol :(";
    sendError(res);
    log(req);
  }

  next();
}

// Improved redirect method with configurable status (for hyper-express only)
export function redirect(res, status, url) {
  if (!res.completed) return res.status(status).header('location', url).send();
  return false;
}

// Removes trailing slash and redirects, adapted from https://stackoverflow.com/a/15773824
export function redirectSlash(req, res, next) {
  if (req.path.slice(-1) === '/' && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');

    let method = req.method;
    let status = (method === "GET") ? 302 : (method === "POST") ? 307 : 302;

    console.log(`[${req.method}] ${status}:\n\tPath: ${req.url}\n\tRedirecting to: ${safepath + query}`);
    redirect(res, status, safepath + query);
  }
  else {
    next();
  }
}

// Single method for setting cookies, across hyper-express & express
//
// 'exp' is cookie lifetime in milliseconds
// 'options' will work with the following properties:
//    domain, path, secure, sameSite, httpOnly
//
// other properties and parameters may require use of the original res.cookie()
// methods respective to each framework
export function cookie(res, name, value, exp, options) {
  if (config.hyper) {
    delete options.maxAge;
    res.cookie(name, value, exp, options);
  }
  else {
    options['maxAge'] = exp;
    res.cookie(name, value, options);
  }
}



