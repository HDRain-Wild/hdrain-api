const currentUserRouter = require('express').Router();
const asyncHandler = require('express-async-handler');

currentUserRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { id, username } = req.currentUser;
    res.json({ id, username });
  })
);

module.exports = currentUserRouter;
