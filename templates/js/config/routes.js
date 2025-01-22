const express = require('express');
const indexRouter = require('../routes/index.js');
const usersRouter = require('../routes/users.js');

const router = express.Router();

router.use('/', indexRouter);
router.use('/users', usersRouter);

module.exports = router;