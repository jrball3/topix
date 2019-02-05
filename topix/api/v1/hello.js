function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

export class V1HelloApi {
  apply = (app) => {
    app.get('api/v1/hello/:name', respond);
    app.head('api/v1/hello/:name', respond);
  }
}

export default V1HelloApi;
