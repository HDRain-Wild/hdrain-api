const { prisma } = require('../db');

const createManyStatus = (newStatusList) =>
  prisma.status.createMany({
    data: newStatusList,
  });

const create = async ({ code, sensorId, experimentId }) =>
  prisma.status.create({
    data: {
      code,
      sensorId,
      experimentId,
    },
  });

const findUnique = async (sensorId, experimentId) =>
  prisma.status.findFirst({
    where: {
      sensorId: parseInt(sensorId, 10),
      experimentId: parseInt(experimentId, 10),
    },
  });
module.exports = { createManyStatus, findUnique, create };
