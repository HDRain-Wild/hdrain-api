const locationsRouter = require('express').Router();
const LocationModel = require('../models/LocationModel');
const SensorModel = require('../models/SensorModel');
const ExperimentModel = require('../models/ExperimentModel');
const StatusModel = require('../models/StatusModel');

const isDatePassed = (date) => new Date(date).getTime() < new Date().getTime();

// LOCATIONS

// Get all the locations
locationsRouter.get('/', async (req, res) => {
  try {
    // Retrieve all locations from the DB
    const locations = await LocationModel.findMany();
    if (!locations.length) res.status(404).send('No locations found');
    else res.status(200).send(locations);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Get one location by its id
locationsRouter.get('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    // Retrieve specific location from the DB
    const location = await LocationModel.findUnique(locationId);
    // Send the result
    res.status(200).send(location);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// SENSORS

// Get all sensors from a location
locationsRouter.get('/:locationId/sensors', async (req, res) => {
  const { locationId } = req.params;
  try {
    let historyExperiment;
    let lastExperiment;
    let experimentId;
    let augmentedSensors;
    const reqTimestamp = req.query.timestamp ? req.query.timestamp : undefined;
    if (reqTimestamp && isDatePassed(reqTimestamp)) {
      const timestamp = new Date(reqTimestamp);
      historyExperiment = await ExperimentModel.findExperimentByTimestamp(
        locationId,
        timestamp
      );
      experimentId = historyExperiment?.id;
    } else {
      lastExperiment = await ExperimentModel.findLatestExperiment(locationId);
      experimentId = lastExperiment?.id;
    }

    if (experimentId) {
      const sensors = await SensorModel.findAllFromLocation(locationId);
      augmentedSensors = await Promise.all(
        sensors.map(async (sensor) => {
          const status = await StatusModel.findUnique(sensor.id, experimentId);
          return {
            ...sensor,
            status: status?.code,
          };
        })
      );
      res.status(200).send(augmentedSensors);
    } else {
      res.send([]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Get one sensor by its id from a location
locationsRouter.get('/:locationId/sensors/:sensorId', async (req, res) => {
  const { sensorId } = req.params;
  try {
    // Retrieve specific sensor from the DB
    const sensor = await SensorModel.findUnique(sensorId);
    res.status(200).send(sensor);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Create a sensor in a location
locationsRouter.post('/:locationId/sensors', async (req, res) => {
  const { locationId } = req.params;
  try {
    const { sensorNumber, spotName, lat, lng, createdAt, deletedAt } = req.body;
    const newSensor = await SensorModel.create({
      sensorNumber,
      spotName,
      lat,
      lng,
      createdAt,
      deletedAt,
      locationId,
    });
    res.status(201).send(newSensor);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// EXPERIMENTS

// Get experiment at a single timestamp from a location
locationsRouter.get('/:locationId/experiments', async (req, res) => {
  const { locationId } = req.params;
  let experiment;
  const reqTimestamp = req.query.timestamp ? req.query.timestamp : undefined;
  try {
    if (reqTimestamp && isDatePassed(reqTimestamp)) {
      const timestamp = new Date(reqTimestamp);
      experiment = await ExperimentModel.findExperimentByTimestamp(
        locationId,
        timestamp
      );
    } else {
      experiment = await ExperimentModel.findLatestExperiment(locationId);
    }
    res.status(200).send(await ExperimentModel.getImagesURL(experiment));
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = locationsRouter;
