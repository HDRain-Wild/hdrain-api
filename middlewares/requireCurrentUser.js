const User = require('../models/UserModel');

module.exports = async (req, res, next) => {
  try {
    req.currentUser = await User.findOne(req.session.userId);
    return next();
  } catch (err) {
    return res.sendStatus(401);
  }
};
