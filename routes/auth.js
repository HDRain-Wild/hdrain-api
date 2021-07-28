const authRouter = require('express').Router();
const asyncHandler = require('express-async-handler');
const { SESSION_COOKIE_DOMAIN, SESSION_COOKIE_NAME } = require('../env');
const { verifyPassword, findByUsername } = require('../models/UserModel');

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const user = await findByUsername(req.body.username);
    if (
      user &&
      (await verifyPassword(req.body.password, user.hashedPassword))
    ) {
      if (req.body.stayConnected) {
        // session cookie will be valid for a week
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
      }
      req.session.userId = user.id;
      req.session.save(() => {
        res.send('Valid Credentials');
      });
    } else {
      res.status(401).send('Invalid Credentials');
    }
  })
);

authRouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).send('Could not destroy session');
    res.clearCookie(SESSION_COOKIE_NAME, { domain: SESSION_COOKIE_DOMAIN });
    return res.status(200).send('session deleted');
  });
});

module.exports = authRouter;
