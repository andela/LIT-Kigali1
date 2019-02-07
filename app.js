import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import methodOverride from 'method-override';
import { joiErrors } from './middlewares';
import routes from './routes';

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

const swaggerYAMLDocs = YAML.load('./docs/swagger.yml');

app.use(cors());

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(routes);
app.use(joiErrors());
app.use('/api-documentation', swaggerUI.server, swaggerUI.setup(swaggerYAMLDocs));


// development error handler
if (!isProduction) {
  app.use('*', (req, res) => {
    res.send('<h1>Welcome to LIT Authors Haven</h1>');
  });
  app.use((err, req, res) => {
    res.status(err.status || 500).json({
      errors: {
        message: err.message,
        error: err
      }
    });
  });
} else {
  // production error handler
  app.use((err, req, res) => {
    res.status(err.status || 500).json({
      errors: {
        message: err.message,
        error: {}
      }
    });
  });
}

export default app;
