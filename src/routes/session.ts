import {
  createSession,
  getAllSession,
  getSession,
  updateSession,
  deleteSession,
  updateStatus,
  getStatus,
} from '../controllers/session';

import { createComment, getAllComment } from '../controllers/comment';
import { createReview } from '../controllers/review';
import express from 'express';
import { restrict } from '../controllers/auth';

const router = express.Router();

router
  .route('/')
  .get(getAllSession)
  .post(restrict('mentor', 'student-leader'), createSession);

router
  .route('/:sessionId')
  .get(getSession)
  .patch(restrict('mentor', 'student-leader'), updateSession)
  .delete(restrict('mentor', 'student-leader'), deleteSession);
router
  .route('/:sessionId/student/updateStatus')
  .patch(restrict('student', 'student-leader'), updateStatus);
router
  .route('/:sessionId/student/status')
  .get(restrict('student', 'student-leader'), getStatus);

router.route('/comment').get(getAllComment).post(createComment);
router.route('/review').post(createReview);
export default router;
