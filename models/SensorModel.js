const { prisma } = require('../db');

const create = async ({
  locationId,
  sensorNumber,
  spotName,
  lat,
  lng,
  timestamp,
}) =>
  prisma.sensor.create({
    data: {
      sensorNumber,
      spotName,
      lat,
      lng,
      createdAt: timestamp,
      locationId: parseInt(locationId, 10),
    },
  });

// store/not sensors from HD Rain
const createSensors = async (sensorsPosition, locationId, timestamp) => {
  // array that will receive the final results
  const storedSensorsList = [];
  const sensorsToStore = Object.entries(sensorsPosition);
  await Promise.all(
    sensorsToStore.map(async (sensor) => {
      const [key, value] = sensor;
      const sensorNumber = parseInt(key, 10);
      const { latitude: lat, longitude: lng, lieux: spotName } = value;
      // function to store sensors in the db
      const storedInTheDb = await create({
        locationId,
        sensorNumber,
        spotName,
        lat,
        lng,
        timestamp,
      });
      return storedSensorsList.push(storedInTheDb);
    })
  );

  return storedSensorsList;
};

const findAll = () => prisma.sensor.findMany();

const findAllFromLocation = (locationId) =>
  prisma.sensor.findMany({
    where: {
      locationId: parseInt(locationId, 10),
    },
  });

const findUnique = (sensorId) =>
  prisma.sensor.findUnique({
    where: {
      id: parseInt(sensorId, 10),
    },
  });

module.exports = {
  createSensors,
  create,
  findAll,
  findUnique,
  findAllFromLocation,
};
