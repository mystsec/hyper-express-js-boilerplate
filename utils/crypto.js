const { subtle } = globalThis.crypto;
import crypto from "crypto";

// Generates random hex string of given length
export function random(len) {
  const buf = crypto.randomBytes(len);
  return buf.toString('hex');
}

// Hashes string using web crypto api digest() and returns as hex
export async function digest(data, algorithm = 'SHA-256') {
  const ec = new TextEncoder();
  const digest = await subtle.digest(algorithm, ec.encode(data));
  return buf2hex(digest);
}

// From https://stackoverflow.com/a/40031979
function buf2hex(buffer) { // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
}

// From https://stackoverflow.com/a/43131635
function hex2buf(hex) {
  return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));
}

// Time safe hex string comparison
export function ts_equals(a, b) {
  return crypto.timingSafeEqual(hex2buf(a), hex2buf(b));
}
