import express from 'express';
import indexRouter from '../routes/index.js';
import usersRouter from '../routes/users.js';

const router = express.Router();

router.use('/', indexRouter);
router.use('/users', usersRouter);

export default router;
