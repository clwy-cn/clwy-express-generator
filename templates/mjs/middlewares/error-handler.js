// middlewares/error-handler.js

export default (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)

  // if you want to use json, you can use res.json instead of res.render
  // res.json({
  //   status: false,
  //   message: err.message
  // });
  res.render('error')
}
