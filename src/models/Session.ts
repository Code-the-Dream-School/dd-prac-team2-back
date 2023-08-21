import mongoose, { Schema, Document } from 'mongoose';

interface ISession extends Document {
  type: 'Mentor Session' | 'Student Leader Session';
  start: Date;
  end: Date;
  creator: {
    _id: string;
    name: string;
  };
  participant: Array<{
    user: {
      userInfo: Schema.Types.ObjectId;
      userStatus: 'confirm' | 'cancel';
    };
  }>;
  discussion: Array<String>;
  review: Array<String>;
  link: string;
}

interface IPopulatedSession extends ISession {
  creator: {
    _id: string;
    name: string;
  };
}

const SessionSchema = new mongoose.Schema<ISession>(
  {
    type: {
      type: String,
      enum: ['Mentor', 'Student Leader'],
    },
    start: {
      type: Date,
      required: [true, 'Please provide start time'],
    },
    end: {
      type: Date,
      required: [true, 'Please provide end time'],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    participant: [
      {
        user: {
          userInfo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
          userStatus: {
            type: String,
            enum: ['confirm', 'cancel'],
          },
        },
      },
    ],
    discussion: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    review: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    link: {
      type: String,
    },
  },
  { timestamps: true }
);

const SessionModel = mongoose.model('Session', SessionSchema);

export { ISession, SessionModel, IPopulatedSession };
