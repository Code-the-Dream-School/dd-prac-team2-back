import User from '../models/User';
import Cohort from '../models/Cohort';
import { SessionModel, ISession, IPopulatedSession } from '../models/Session';
import { Week } from '../models/Week';
import { Request, Response } from 'express';
import {
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
} from '../errors';
import scheduleEvent from '../utils/createGoogleSchedule';

const createSession = async (req: Request, res: Response) => {
  const { start, end, type, link, weekId } = req.body;

  if (!start || !end || !type || !link) {
    throw new BadRequestError('Missing values');
  }

  const session = await SessionModel.create({
    start,
    end,
    type,
    link,
    creator: req.user.userId,
  });
  const week = await Week.findOneAndUpdate(
    { _id: weekId },
    { $push: { sessions: session.id } }
  );

  return res.status(201).json({ session });
};

const getAllSession = async (req: Request, res: Response) => {
  const sessions = await SessionModel.find({});

  if (!sessions) {
    return res
      .status(200)
      .json({ status: 'Success', message: 'There are no sessions' });
  }

  res.status(200).json({ status: 'Success', sessions });
};

const getSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const populateParticipantOptions = {
    path: 'participant.user.userInfo',
    select: '_id name ',
  };
  const populateCreatorOptions = {
    path: 'creator',
    select: '_id name ',
  };
  const populateDiscussionOptions = {
    path: 'discussion',
    select: '_id name content ',
  };

  const session = await SessionModel.findOne({ _id: sessionId })
    .populate(populateParticipantOptions)
    .populate(populateCreatorOptions)
    .populate(populateDiscussionOptions);

  if (!session) {
    throw new BadRequestError('This session does not exist');
  }
  res.status(200).json({ status: 'Success', session });
};

const updateSession = async (req: Request, res: Response) => {
  const {
    body: { start, end, type, link, userStatus },
  } = req;

  const { sessionId } = req.params;

  if (start === '' || end === '' || type === '' || link === '') {
    throw new BadRequestError(
      'Name or Start or End or Type or Link fields cannot be empty'
    );
  }

  const session = await SessionModel.findOneAndUpdate(
    { _id: sessionId, creator: req.user.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!session) {
    throw new BadRequestError('This session does not exist');
  }

  return res.status(201).json({ session });
};

const deleteSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = await SessionModel.findByIdAndRemove({
    _id: sessionId,
    creator: req.user.userId,
  });

  if (!session) {
    throw new BadRequestError('This session does not exist');
  }

  res.status(200).json({ status: 'Success! Session removed.' });
};

const updateStatus = async (req: Request, res: Response) => {
  const { userStatus } = req.body;
  const { sessionId } = req.params;

  const sessionUser = await SessionModel.findOneAndUpdate(
    { _id: sessionId, 'participant.user.userInfo': req.user.userId },
    { $set: { 'participant.$.user.userStatus': userStatus } },
    { new: true }
  );
  if (!sessionUser) {
    const newSessionUser = await SessionModel.findOneAndUpdate(
      { _id: sessionId },
      {
        $addToSet: {
          participant: {
            user: {
              userInfo: req.user.userId,
              userStatus,
            },
          },
        },
      },
      { new: true }
    );
    if (!newSessionUser) {
      throw new BadRequestError('Can not update this session');
    }

    let event;
    if (sessionUser || newSessionUser) {
      if (userStatus !== 'confirm') {
        throw new BadRequestError('Can not update your calendar');
      }
      const populateCreatorOptions = {
        path: 'creator',
        select: 'name ',
      };

      const sessionInfo = (await SessionModel.findOne({
        _id: sessionId,
      }).populate(populateCreatorOptions)) as IPopulatedSession;

      const sessionStart = sessionInfo?.start;
      const sessionEnd = sessionInfo?.end;
      const sessionType = sessionInfo?.type;
      const sessionCreator = sessionInfo?.creator.name;

      if (!sessionType || !sessionEnd || !sessionStart) {
        throw new BadRequestError('Session does not exist');
      }
      event = await scheduleEvent({
        summary: sessionType,
        start: sessionStart,
        end: sessionEnd,
        email: req.user.email,
        description: sessionCreator,
      });
    }

    return res.status(201).json({ newSessionUser, event });
  }
  return res.status(201).json({ sessionUser });
};

const getUpcomingSessions = async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const currentTime = new Date().toISOString();

  const sessions = await SessionModel.find({
    creator: userId,
    start: { $gt: currentTime },
  })
    .limit(4)
    .sort({ start: 1 });

  return res.json({ sessions });
};

export {
  createSession,
  getAllSession,
  getSession,
  updateSession,
  deleteSession,
  updateStatus,
  getUpcomingSessions,
};
