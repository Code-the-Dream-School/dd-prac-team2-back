import mongoose, { Document, Mongoose, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_EXPIRATION,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_SECRET,
} from '../config';
import Cohort from './Cohort';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  confirmationCode: string;
  isActivated: boolean;
  role: Array<'admin' | 'student' | 'student-leader' | 'mentor'>;
  cohorts: Array<string>;
  refreshToken?: string;
  OAuthToken?: string;
  createJWT: () => string;
  createRefreshToken: () => string;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true, // creates a unique index in the db for each email
    },
    password: {
      type: String,
      // required: [true, 'Please provide a password'],
      minlength: 6,
    },
    confirmationCode: {
      type: String,
      required: [true, 'Please provide a confimation code'],
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: [String],
      enum: ['admin', 'student', 'student-leader', 'mentor'],
      default: ['student'],
    },
    cohorts: [
      {
        type: Schema.Types.ObjectId,
        ref: Cohort,
      },
    ],
    OAuthToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Pre implemented middleware provided by mongoose, reached before saving the model
// This will preprocess the password and hash it before saving
UserSchema.pre('save', async function (next) {
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }
});

// Adds and instance method the our Model
// Since we refer to this here, we cannot use arrow functions
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name, role: this.role, email: this.email },
    ACCESS_TOKEN_SECRET!,
    {
      expiresIn: ACCESS_TOKEN_EXPIRATION!,
    }
  );
};

UserSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { userId: this._id, name: this.name, role: this.role, email: this.email },
    REFRESH_TOKEN_SECRET!,
    {
      expiresIn: REFRESH_TOKEN_EXPIRATION!,
    }
  );
};

UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', UserSchema);
