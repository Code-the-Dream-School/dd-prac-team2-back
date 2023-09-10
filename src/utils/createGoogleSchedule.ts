import { google } from 'googleapis';
import moment from 'moment-timezone';
import User from '../models/User';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_URL,
} from '../config';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_URL
);

const scheduleEvent = async ({
  summary,
  start,
  end,
  email,
  description,
}: {
  summary: string;
  start: Date;
  end: Date;
  email: string;
  description: string;
}) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('error');
  }
  let new_refresh_token;
  if (user?.OAuthToken) {
    new_refresh_token = user.OAuthToken;
  }

  const formattedStart = moment(start).format('YYYY-MM-DDTHH:mm:ssZ');
  const formattedEnd = moment(end).format('YYYY-MM-DDTHH:mm:ssZ');

  oauth2Client.setCredentials({
    refresh_token: new_refresh_token,
  });
  const calendar = google.calendar('v3');
  const response = await calendar.events.insert({
    auth: oauth2Client,
    calendarId: 'primary',
    requestBody: {
      summary: summary,
      description: description,
      start: {
        dateTime: formattedStart,
      },
      end: {
        dateTime: formattedEnd,
      },
    },
  });
  if (!response) return 'Events failed to save in your Google Calendar';
  return 'Events successfully saved in your Google Calendar';
};

export default scheduleEvent;
