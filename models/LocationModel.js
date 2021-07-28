const { prisma } = require('../db');

const findMany = () => prisma.location.findMany();

const findUnique = (id) =>
  prisma.location.findUnique({ where: { id: parseInt(id, 10) } });

const create = ({ name, lat, lng, sensors, experiments }) =>
  prisma.location.create({
    data: {
      name,
      lat,
      lng,
      sensors,
      experiments,
    },
  });

module.exports = {
  findMany,
  findUnique,
  create,
};
