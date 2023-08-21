import mongoose, { Schema, Document } from 'mongoose';

export interface IWeek extends Document {
  name: string;
  start: Date;
  end: Date;
  sessions: Array<String>;
}

const WeekSchema = new mongoose.Schema<IWeek>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    start: {
      type: Date,
      required: [true, 'Please provide start time'],
    },
    end: {
      type: Date,
    },
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Session',
      },
    ],
  },
  { timestamps: true }
);

const calculateEnd = (start: any) => {
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + 6);
  return endDate;
};

WeekSchema.pre('save', function (next) {
  if (this.start) {
    this.end = calculateEnd(this.start);
  }
  next();
});

const Week = mongoose.model<IWeek>('Week', WeekSchema);

export { Week, calculateEnd };
