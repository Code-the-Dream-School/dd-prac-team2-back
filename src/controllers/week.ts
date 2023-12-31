import Cohort from '../models/Cohort';
import { calculateEnd } from '../models/Week';
import { Request, Response } from 'express';
import { BadRequestError } from '../errors';

const createWeek = async (req: Request, res: Response) => {
  const { name, start, cohortId } = req.body;
  if (!name || !start || !cohortId) {
    throw new BadRequestError('Missing values');
  }

  const newWeek = { name, start };

  const cohort = await Cohort.findById(cohortId);
  if (!cohort) {
    throw new BadRequestError('Cohort not found');
  }

  cohort.weeks.push(newWeek as any);
  const updatedCohort = await cohort.save();

  // return res.sendStatus(204);
  return res.status(201).json({ week: updatedCohort.weeks.at(-1) });
};

const getAllWeek = async (req: Request, res: Response) => {
  const { cohortId } = req.params;
  const cohort = await Cohort.findById(cohortId);

  if (!cohort) {
    throw new BadRequestError('Cohort not found');
  }

  res.status(200).json({ weeks: cohort.weeks });
};

const getWeek = async (req: Request, res: Response) => {
  const { cohortId, weekId } = req.params;

  const cohort = await Cohort.findById(cohortId);
  if (!cohort) {
    throw new BadRequestError('Cohort not found');
  }

  const weekIndex = cohort.weeks.findIndex((w) => w._id == weekId);

  await cohort.populate({
    path: `weeks.${weekIndex}.sessions`,
  });

  res
    .status(200)
    .json({ status: 'Success', populatedWeek: cohort.weeks[weekIndex] });
};

const getWeekByIndex = async (req: Request, res: Response) => {
  const { cohortId, index } = req.params;

  const cohort = await Cohort.findById(cohortId);
  if (!cohort) {
    throw new BadRequestError('Cohort not found');
  }

  const i = parseInt(index);
  if (isNaN(i) || !cohort.weeks[i]) {
    throw new BadRequestError('Invalid week index');
  }

  await cohort.populate({
    path: `weeks.${i}.sessions`,
    populate: {
      path: 'creator',
      select: 'name',
    },
    options: { strictPopulate: false },
  });

  res.status(200).json({ populatedWeek: cohort.weeks[i] });
};

const updateWeek = async (req: Request, res: Response) => {
  const { cohortId, weekId } = req.params;

  const cohort = await Cohort.findById(cohortId);
  if (!cohort) {
    throw new BadRequestError('Cohort not found');
  }

  const { name, start } = req.body;

  if (name === '' || start === '') {
    throw new BadRequestError('Name or Start fields cannot be empty');
  }
  const updatedEnd = calculateEnd(start);

  const week = cohort.weeks.find((w) => w._id == weekId);
  if (!week) {
    throw new BadRequestError('This week does not exist');
  }
  week.name = name;
  week.start = start;
  week.end = updatedEnd;

  await cohort.save();

  return res.status(201).json({ week });
};

const deleteWeek = async (req: Request, res: Response) => {
  const { cohortId, weekId } = req.params;
  const cohort = await Cohort.findById(cohortId);
  if (!cohort) {
    throw new BadRequestError('Cohort not found');
  }

  const weekIndex = cohort.weeks.findIndex((w) => w._id == weekId);

  if (weekIndex >= 0) {
    cohort.weeks.splice(weekIndex, 1);
    await cohort.save();
  }

  res.sendStatus(204);
};

const currentWeek = async (req: Request, res: Response) => {
  const { cohortId } = req.params;

  const cohort = await Cohort.findById(cohortId);
  if (!cohort) {
    throw new BadRequestError('Cohort not found');
  }

  const currentTime = Date.now();

  const weekIndex = cohort.weeks.findIndex(
    (w) => w.start.getTime() < currentTime && w.end.getTime() > currentTime
  );

  if (weekIndex >= 0 && weekIndex < cohort.weeks.length) {
    await cohort.populate({
      path: `weeks.${weekIndex}.sessions`,
      populate: {
        path: 'creator',
        select: 'name',
      },
      options: { strictPopulate: false },
    });
    res.status(200).json({ currentWeek: cohort.weeks[weekIndex] });
  } else {
    res.status(404).json({ message: 'No active week found' });
  }
};

export {
  getAllWeek,
  getWeek,
  getWeekByIndex,
  updateWeek,
  deleteWeek,
  createWeek,
  currentWeek,
};
