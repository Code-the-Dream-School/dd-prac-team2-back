import crypto from 'node:crypto';

function getConfirmationCode(): string {
  const chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let pwd = '';
  while (pwd.length < 8) {
    pwd += chars[crypto.randomInt(62)];
  }

  return pwd;
}

export default getConfirmationCode;
