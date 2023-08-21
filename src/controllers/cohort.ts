import User from '../models/User';
import Cohort from '../models/Cohort';
import { Week } from '../models/Week';
import { Request, Response } from 'express';
import { BadRequestError, UnauthenticatedError } from '../errors';

const createCohort = async (req: Request, res: Response) => {
  const { name, start, end, type } = req.body;
  if (!name || !start || !end || !type) {
    throw new BadRequestError('Missing values');
  }

  const cohort = await Cohort.create({ name, start, end, type });

  return res.status(201).json({ cohort });
};

const getAllCohort = async (req: Request, res: Response) => {
  const cohorts = await Cohort.find({}).populate('participants', '_id name');

  if (!cohorts) {
    return res
      .status(200)
      .json({ status: 'Success', message: 'There are no cohorts' });
  }

  res.status(200).json({ status: 'Success', cohorts });
};

const getCohort = async (req: Request, res: Response) => {
  const { cohortId } = req.params;

  const populateWeekOptions = {
    path: 'weeks',
    select: '_id name start end sessions',
  };

  const populateUserOptions = {
    path: 'participants',
    select: '_id name email role isActivated',
  };

  const cohort = await Cohort.find({ _id: cohortId })
    .populate(populateWeekOptions)
    .populate(populateUserOptions);

  if (!cohort) {
    throw new BadRequestError('This cohort does not exist');
  }
  res.status(200).json({ status: 'Success', cohort });
};

const updateCohort = async (req: Request, res: Response) => {
  const { cohortId } = req.params;

  const {
    body: { name, start, end, type },
  } = req;

  if (name === '' || start === '' || end === '' || type === '') {
    throw new BadRequestError(
      'Name or Start or End or Type fields cannot be empty'
    );
  }
  const cohort = await Cohort.findByIdAndUpdate({ _id: cohortId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!cohort) {
    throw new BadRequestError('This cohort does not exist');
  }
  return res.status(201).json({ cohort });
};

const deleteCohort = async (req: Request, res: Response) => {
  const { cohortId } = req.params;

  const cohort = await Cohort.findByIdAndRemove({ _id: cohortId });

  if (!cohort) {
    throw new BadRequestError('This cohort does not exist');
  }

  res.status(200).json({ status: 'Success! Cohort removed.' });
};

const createWeeks = async (req: Request, res: Response) => {
  const { cohortId } = req.params;
  const { start, numWeek } = req.body;
  if (!start || !numWeek) {
    throw new BadRequestError('Missing values');
  }

  const firstWeek = await Week.create({
    name: 'Week 1',
    start,
  });
  const cohort = await Cohort.findOneAndUpdate(
    { _id: cohortId },
    { $push: { weeks: firstWeek._id } }
  );

  const startWeek = new Date(start);
  for (let i = 1; i < numWeek; i++) {
    const nextStartWeek = new Date(
      startWeek.getTime() + 7 * i * 24 * 60 * 60 * 1000
    );
    const nextNewWeeks = await Week.create({
      name: `Week ${i + 1}`,
      start: nextStartWeek,
    });
    await Cohort.findOneAndUpdate(
      { _id: cohortId },
      { $push: { weeks: nextNewWeeks._id } }
    );
  }
  const populateWeekOptions = {
    path: 'weeks',
    select: '_id name start end sessions',
  };
  const updatedCohort = await Cohort.findById({ _id: cohortId }).populate(
    populateWeekOptions
  );

  res.status(201).json({ updatedCohort });
};

export {
  getAllCohort,
  getCohort,
  updateCohort,
  deleteCohort,
  createCohort,
  createWeeks,
};
