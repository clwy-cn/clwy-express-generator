import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  // if you want to use json, you can use res.json instead of res.render
  // res.json({ title: 'Express' });
  res.render('index', { title: 'Express' });
});

export default router;
