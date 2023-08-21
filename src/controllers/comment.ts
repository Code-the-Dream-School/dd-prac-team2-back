import User from '../models/User';
import Cohort from '../models/Cohort';
import { Week } from '../models/Week';
import { SessionModel, ISession } from '../models/Session';
import Comment from '../models/Comment';
import { Request, Response } from 'express';
import { BadRequestError, UnauthenticatedError } from '../errors';

const createComment = async (req: Request, res: Response) => {
  const { sessionId, content } = req.body;
  if (!content) {
    throw new BadRequestError('Missing values');
  }

  const comment = await Comment.create({
    sessionId,
    content,
    name: req.user.userId,
  });

  const session = await SessionModel.findOneAndUpdate(
    { _id: sessionId },
    { $push: { discussion: comment.id } }
  );

  return res.status(201).json({ comment });
};

const getAllComment = async (req: Request, res: Response) => {
  const comments = await Comment.find({});

  if (!comments) {
    return res
      .status(200)
      .json({ status: 'Success', message: 'There are no comments' });
  }

  res.status(200).json({ status: 'Success', comments });
};

export { createComment, getAllComment };
