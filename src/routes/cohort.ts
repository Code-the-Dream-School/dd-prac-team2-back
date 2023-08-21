import {
  getAllCohort,
  getCohort,
  updateCohort,
  deleteCohort,
  createCohort,
  createWeeks,
} from '../controllers/cohort';
import express from 'express';
import { restrict } from '../controllers/auth';

const router = express.Router();

router.route('/').get(getAllCohort).post(restrict('admin'), createCohort);
router
  .route('/:cohortId')
  .get(getCohort)
  .patch(restrict('admin'), updateCohort)
  .delete(restrict('admin'), deleteCohort);
router.route('/create-weeks/:cohortId').post(createWeeks);

export default router;
