import User from '../models/User';
import Cohort from '../models/Cohort';
import { Week, calculateEnd } from '../models/Week';
import { Request, Response } from 'express';
import { BadRequestError, UnauthenticatedError } from '../errors';
import moment from 'moment-timezone';

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
    throw new BadRequestError('This week does not exist');
  }
  res.status(200).json({ status: 'Success', week });
};

const updateWeek = async (req: Request, res: Response) => {
  const { weekId } = req.params;

  const { name, start } = req.body;

  if (name === '' || start === '') {
    throw new BadRequestError('Name or Start fields cannot be empty');
  }
  const updateEnd = calculateEnd(start);

  const week = await Week.findByIdAndUpdate(
    { _id: weekId },
    {
      name,
      start,
      end: updateEnd,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!week) {
    throw new BadRequestError('This week does not exist');
  }
  return res.status(201).json({ week });
};

const deleteWeek = async (req: Request, res: Response) => {
  const { weekId } = req.params;

  const week = await Week.findByIdAndRemove({ _id: weekId });

  if (!weekId) {
    throw new BadRequestError('This week does not exist');
  }

  res.status(200).json({ status: 'Success! Week removed.' });
};

const currentWeek = async (req: Request, res: Response) => {
  const { cohortId, userTimeZone } = req.body;

  if (!cohortId || !userTimeZone) {
    throw new BadRequestError('Missing arguments in the request');
  }

  const populateOptions = {
    path: 'weeks',
    select: 'start end',
  };
  const cohort = await Cohort.findById({ _id: cohortId }).populate(
    populateOptions
  );

  if (!cohort) {
    throw new BadRequestError('This cohort does not exist');
  }

  const weeks = cohort?.weeks;
  if (!weeks || weeks.length === 0) {
    throw new BadRequestError('Cannot find the current week');
  }

  const getCurrentWeek = findCurrentWeek(userTimeZone, weeks);
  const currentWeek = await Week.findById({
    _id: getCurrentWeek.id,
  }).populate({
    path: 'sessions',
    populate: {
      path: 'creator',
      select: 'name',
    },
  });

  res.json({
    status: 'Success',
    currentWeek,
  });
};

function findCurrentWeek(userTimeZone: any, weeks: any) {
  const now = moment().tz(userTimeZone);

  for (const week of weeks) {
    if (now.isBetween(moment(week.start), moment(week.end), 'day', '[]')) {
      return week;
    }
  }

  return weeks[weeks.length - 1];
}

export { getAllWeek, getWeek, updateWeek, deleteWeek, createWeek, currentWeek };
