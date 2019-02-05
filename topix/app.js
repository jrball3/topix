import V1HelloApi from './api/v1/hello';
require('dotenv').config();

const restify = require('restify');

const server = restify.createServer();
const hello = new V1HelloApi();
hello.apply(server);

console.log(process.env);

server.listen(process.env.API_PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
