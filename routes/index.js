const requireCurrentUser = require('../middlewares/requireCurrentUser');
const authRouter = require('./auth');
const currentUserRouter = require('./currentUser');
const locationsRouter = require('./locations');
const syncRouter = require('./sync');

module.exports = (app) => {
  app.use('/auth', authRouter);
  app.use('/currentUser', requireCurrentUser, currentUserRouter);
  app.use('/locations', requireCurrentUser, locationsRouter);
  app.use('/sync', requireCurrentUser, syncRouter);
};
