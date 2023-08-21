import { Request, Response } from 'express';
import User from '../models/User';

const getCohorts = async (req: Request, res: Response) => {
  const populateCohortOptions = {
    path: 'cohorts',
    select: 'name',
  };

  const user = await User.findById(req.user.userId).populate(
    populateCohortOptions
  );

  return res.status(200).json({ cohorts: user!.cohorts });
};

export { getCohorts };
