import User from '../models/User';
import Cohort from '../models/Cohort';
import Week from '../models/Week';
import { Request, Response } from 'express';
import { BadRequestError, UnauthenticatedError } from '../errors';

const createWeek = async (req: Request, res: Response) => {
  const { name, start, cohortId } = req.body;
  if (!name || !start) {
    throw new BadRequestError('Missing values');
  }

  const week = await Week.create({ name, start });

  const cohort = await Cohort.findOneAndUpdate(
    { _id: cohortId },
    { $push: { weeks: week.id } }
  );

  return res.status(201).json({ week });
};

const getAllWeek = async (req: Request, res: Response) => {
  const weeks = await Week.find({});

  if (!weeks) {
    return res
      .status(200)
      .json({ status: 'Success', message: 'There are no weeks' });
  }

  res.status(200).json({ status: 'Success', weeks });
};

const getWeek = async (req: Request, res: Response) => {
  const { weekId } = req.params;

  const populateSessionOptions = {
    path: 'sessions',
    select: '_id type start end creator',
    populate: {
      path: 'creator',
      select: '_id name',
    },
  };

  const week = await Week.findOne({ _id: weekId }).populate(
    populateSessionOptions
  );

  if (!week) {
    throw new BadRequestError('This cohort does not exist');
  }
  res.status(200).json({ status: 'Success', week });
};

const updateWeek = async (req: Request, res: Response) => {
  const { weekId } = req.params;

  const {
    body: { name, start },
  } = req;

  if (name === '' || start === '') {
    throw new BadRequestError('Name or Start fields cannot be empty');
  }
  const week = await Cohort.findByIdAndUpdate({ _id: weekId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!week) {
    throw new BadRequestError('This week does not exist');
  }
  return res.status(201).json({ week });
};

const deleteWeek = async (req: Request, res: Response) => {
  const { weekId } = req.params;

  const week = await Cohort.findByIdAndRemove({ _id: weekId });

  if (!weekId) {
    throw new BadRequestError('This cohort does not exist');
  }

  res.status(200).json({ status: 'Success! Week removed.' });
};

export { getAllWeek, getWeek, updateWeek, deleteWeek, createWeek };
