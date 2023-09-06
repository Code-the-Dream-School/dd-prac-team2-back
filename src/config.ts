import dotenv from 'dotenv';

dotenv.config();

const {
  NODE_ENV,
  DATABASE,
  DATABASE_PASSWORD,
  PORT_CONFIG,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_URL,
  MAIL_SMTP_SERVER,
  MAIL_PORT,
  MAIL_LOGIN,
  MAIL_PWD,
  WEBSITE_URL,
  SLACK_API_BOT_USER_OAUTH_TOKEN,
} = process.env;

const requiredValues = [
  'NODE_ENV',
  'DATABASE',
  'DATABASE_PASSWORD',
  'PORT_CONFIG',
  'ACCESS_TOKEN_SECRET',
  'ACCESS_TOKEN_EXPIRATION',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRATION',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CLIENT_URL',
  'MAIL_SMTP_SERVER',
  'MAIL_PORT',
  'MAIL_LOGIN',
  'MAIL_PWD',
  'WEBSITE_URL',
  'SLACK_API_BOT_USER_OAUTH_TOKEN',
];

for (const value of requiredValues) {
  if (!process.env[value]) {
    console.error(`${value} is required in the .env file`);
    process.exit(1);
  }
}

export {
  NODE_ENV,
  DATABASE,
  DATABASE_PASSWORD,
  PORT_CONFIG,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_URL,
  MAIL_SMTP_SERVER,
  MAIL_PORT,
  MAIL_LOGIN,
  MAIL_PWD,
  WEBSITE_URL,
  SLACK_API_BOT_USER_OAUTH_TOKEN,
};
