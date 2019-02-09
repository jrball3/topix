const V1UserApi = require('./api/v1/user').V1UserApi
const V1AuthApi = require('./api/v1/auth').V1AuthApi
const V1RegisterApi = require('./api/v1/register').V1RegisterApi
const restify = require('restify')
require('./database')

const app = restify.createServer()
app.use(restify.plugins.queryParser())
app.use(restify.plugins.bodyParser())

const auth = new V1AuthApi([
  /api\/v1\/hello.*/,
  /api\/v1\/auth.*/,
  /api\/v1\/register.*/
])
auth.apply(app)

const user = new V1UserApi()
user.apply(app)

const register = new V1RegisterApi()
register.apply(app)

module.exports = app
