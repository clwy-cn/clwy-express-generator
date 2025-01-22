var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // if you want to use json, you can use res.json instead of res.render
  // res.json({ title: 'Express' });
  res.render('index', { title: 'Express' });
});

module.exports = router;
