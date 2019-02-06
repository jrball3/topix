import V1HelloApi from './api/v1/hello';
import V1UserApi from './api/v1/user';
import V1AuthApi from './api/v1/auth';
import V1RegisterApi from './api/v1/register';
require('./database');
import dotenv from 'dotenv';
dotenv.config();

const restify = require('restify');

const app = restify.createServer();
app.use(restify.plugins.queryParser());
app.use(restify.plugins.bodyParser());

const auth = new V1AuthApi([
  /api\/v1\/hello.*/,
  /api\/v1\/auth.*/,
  /api\/v1\/register.*/
]);
auth.apply(app);

const hello = new V1HelloApi();
hello.apply(app);

const user = new V1UserApi();
user.apply(app);

const register = new V1RegisterApi();
register.apply(app);

const port = process.env.API_PORT;

app.listen(port, function() {
  console.log('%s listening at %s', app.name, app.url);
});
