const { prisma } = require('../db');

const findSession = (sessionId) =>
  prisma.session.findUnique({ where: { sid: sessionId } });

module.exports = {
  findSession,
};
