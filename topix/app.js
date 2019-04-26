const V1UserApi = require('./api/v1/user').V1UserApi
const V1AuthApi = require('./api/v1/auth').V1AuthApi
const V1FriendshipApi = require('./api/v1/friendship').V1FriendshipApi
const V1GameApi = require('./api/v1/game').V1GameApi
const V1PostApi = require('./api/v1/post').V1PostApi
const restify = require('restify')
require('./database')

const app = restify.createServer()
app.use(restify.plugins.queryParser())
app.use(restify.plugins.bodyParser())

const auth = new V1AuthApi({
  path: [
    /api\/v1\/auth.*/,
    { url: /api\/v1\/user.*/, methods: ['POST'] }
  ]
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

module.exports = app
