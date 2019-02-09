const app = require('./app')

app.listen(3000, function () {
  console.log('%s listening at %s', app.name, app.url)
})
