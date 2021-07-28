const express = require('express');
const cors = require('cors');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);

const {
  PORT,
  CORS_ALLOWED_ORIGINS,
  inTestEnv,
  inProdEnv,
  SESSION_COOKIE_SECRET,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_DOMAIN,
} = require('./env');
const initRoutes = require('./routes');
const handleRecordNotFoundError = require('./middlewares/handleRecordNotFoundError');
const handleValidationError = require('./middlewares/handleValidationError');
const handleServerInternalError = require('./middlewares/handleServerInternalError');

require('dotenv').config();

require('./rabbitWorker')();

const { db } = require('./db');

const port = PORT || 5000;

const app = express();

app.use(express.json());
app.use('/storage', express.static('storage'));
app.set('x-powered-by', false); // for security
app.set('trust proxy', 1); // trust first proxy

const allowedOrigins = CORS_ALLOWED_ORIGINS.split(',');
const corsOptions = {
  origin: (origin, callback) => {
    if (origin === undefined || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  session({
    key: SESSION_COOKIE_NAME,
    secret: SESSION_COOKIE_SECRET,
    store: new PgSession({
      createTableIfMissing: true,
      pool: db,
      tableName: 'session',
    }),
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: inProdEnv,
      domain: SESSION_COOKIE_DOMAIN,
      sameSite: true,
      httpOnly: true,
    },
  })
);
app.use(handleRecordNotFoundError);
app.use(handleValidationError);
app.use(handleServerInternalError);

initRoutes(app);

const server = app.listen(port, () => {
  if (!inTestEnv) console.log(`Server is running on port: ${port}`);
});

// process setup : improves error reporting
process.on('unhandledRejection', (error) => {
  console.error('unhandledRejection', JSON.stringify(error), error.stack);
});
process.on('uncaughtException', (error) => {
  console.error('uncaughtException', JSON.stringify(error), error.stack);
});

module.exports = server;
