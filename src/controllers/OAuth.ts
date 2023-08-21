import User from '../models/User';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import qs from 'qs';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config';

interface GoogleOauthToken {
  id_token: string;
  access_token: string;
  refresh_token: string;
}

const getGoogleOauthToken = async ({
  code,
}: {
  code: string;
}): Promise<GoogleOauthToken | undefined> => {
  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: 'http://localhost:8000/auth/google/callback',
    grant_type: 'authorization_code',
  };
  try {
    const data = await axios.post(url, qs.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return data.data;
  } catch (err) {
    console.log(err);
  }
};

const googleOauthHandler = async (req: Request, res: Response) => {
  const code: any = req.query.code;

  try {
    if (!code) {
      res.status(400).send('Invalid authorization code');
      return;
    }

    const googleOauthToken = await getGoogleOauthToken({ code });

    if (!googleOauthToken) {
      res.status(401).send('Google OAuth token not found');
      return;
    }

    const { id_token } = googleOauthToken;
    const { refresh_token } = googleOauthToken;
    const OAuthToken = refresh_token;

    if (id_token && OAuthToken) {
      const googleUser = jwt.decode(id_token) as {
        email?: string;
        name?: string;
        picture?: string;
      };
      const email = googleUser.email;
      try {
        const user = await User.findOne({ email });
        if (!user) {
          res.redirect('http://localhost:3000/login');
          return res.status(403).send('Account is not exist');
        }

        const token = user.createJWT();
        const refreshToken = user.createRefreshToken();

        await user.updateOne({ refreshToken, OAuthToken });

        res.cookie('token', refreshToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.redirect('http://localhost:3000');

        return res.status(200).json({
          user: { name: user.name, userId: user._id, email: user.email },
          token,
        });
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err);
    res.redirect('http://localhost:3000/login');
  }
};

export default googleOauthHandler;
