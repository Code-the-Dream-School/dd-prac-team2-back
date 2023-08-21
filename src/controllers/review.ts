import User from '../models/User';
import Cohort from '../models/Cohort';
import { Week } from '../models/Week';
import { SessionModel, ISession } from '../models/Session';
import Comment from '../models/Comment';
import Review from '../models/Review';
import { Request, Response } from 'express';
import { BadRequestError } from '../errors';

const createReview = async (req: Request, res: Response) => {
  const { sessionId, content } = req.body;
  if (!content) {
    throw new BadRequestError('Missing values');
  }

  const review = await Review.create({
    sessionId,
    content,
  });

  const session = await SessionModel.findOneAndUpdate(
    { _id: sessionId },
    { $push: { review: review.id } }
  );

  return res.status(201).json({ review });
};

export { createReview };
