var restifySwaggerJsdoc = require('restify-swagger-jsdoc');

function applySwagger (app) {
  const swaggerDoc = {
    title: 'Topix API',
    version: '0.0.1',
    openapi: '3.0.0',
    description: 'This is the API documentation for the Topix API.',
    server: app,
    host: 'localhost:3000',
    path: '/docs',
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        scheme: 'bearer',
        in: 'header',
      },
    },
    apis: [
      './api/v1/auth.js', 
      './api/v1/friendship.js', 
      './api/v1/game.js', 
      './api/v1/post.js', 
      './api/v1/score.js', 
      './api/v1/user.js', 
    ],
  }

  restifySwaggerJsdoc.createSwaggerPage(swaggerDoc);
};

module.exports = applySwagger
