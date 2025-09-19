const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
const port = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Project 2 API', version: '1.0.0' },
  },
  apis: ['./routes/*.js'],
};
const specs = swaggerJsdoc(options);

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/', require('./routes'));

mongodb.initDb((err) => {
  if (err) {
    console.log('Database initialization error:', err);
  } else {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }
});