import express from 'express';
import path from 'path';
import cors from 'cors';
import passport from 'passport';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import session from 'express-session';
import YAML from 'yamljs';
import cookie from 'cookie-parser';
import methodOverride from 'method-override';
import { joiErrors } from './middlewares';
import './middlewares/passportStrategies';
import routes from './routes';

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

const swaggerYAMLDocs = YAML.load('./docs/swagger.yml');
const BetterMemoryStore = require('session-memory-store')(session);

app.use(cors());
app.use(cookie());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
const store = new BetterMemoryStore({ expires: 60 * 60 * 1000, debug: true });
app.use(
  session({
    name: 'JSESSION',
    secret: 'MYSECRETISVERYSECRET',
    store,
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);
app.use(joiErrors());
app.use('/api-documentation', swaggerUI.serve, swaggerUI.setup(swaggerYAMLDocs));
app.use('/', express.static('ui'));
// development error handler
if (!isProduction) {
  // / catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  app.get('/*', (req, res, next) => {
    if (req.headers.host.match(/^www\./) != null) {
      res.redirect(`http://${req.headers.host.slice(4)}${req.url}`, 301);
    } else {
      next();
    }
  });
}

app.use((err, req, res) => {
  res.status(err.status || 500).json({
    errors: {
      message: err.message,
      error: err,
    },
  });
});

export default app;
