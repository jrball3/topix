function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

export class V1HelloApi {
  apply(server) {
    server.get('/hello/:name', respond);
    server.head('/hello/:name', respond);
  }
}

export default V1HelloApi;
