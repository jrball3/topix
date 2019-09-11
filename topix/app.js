const V1UserApi = require('./api/v1/user').V1UserApi
const V1AuthApi = require('./api/v1/auth').V1AuthApi
const V1FriendshipApi = require('./api/v1/friendship').V1FriendshipApi
const V1GameApi = require('./api/v1/game').V1GameApi
const V1PostApi = require('./api/v1/post').V1PostApi
const V1ScoreApi = require('./api/v1/score').V1ScoreApi
const logger  = require('morgan')
const applySwagger = require('./swagger')

const restify = require('restify')
require('./database')

const app = restify.createServer()
app.use(restify.plugins.queryParser())
app.use(restify.plugins.bodyParser())
app.use(logger('combined'))

const healthCheck = (req, res, next) => {
  res.send({'status': 'OK'})
  return next()
}

app.get('/', healthCheck)
app.get('/healthz', healthCheck)

const excludeFromAuth = {
  path: [
    '/',
    '/healthz',
    '/docs',
    /\/docs\/+.*/,
    /api\/v1\/auth.*/,
    { url: /api\/v1\/user.*/, methods: ['POST'] },
  ]
}

const auth = new V1AuthApi({
  excludePaths: excludeFromAuth
})

auth.apply(app)

const user = new V1UserApi()
user.apply(app)

const register = new V1FriendshipApi()
register.apply(app)

const game = new V1GameApi()
game.apply(app)

const post = new V1PostApi()
post.apply(app)

const score = new V1ScoreApi()
score.apply(app)

applySwagger(app)

module.exports = app
