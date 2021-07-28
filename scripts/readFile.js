const fs = require('fs');
const util = require('util');
const globCB = require('glob');
const ExperimentModel = require('../models/ExperimentModel');
const SensorModel = require('../models/SensorModel');
const StatusModel = require('../models/StatusModel');

// Convert `fs.readFile()` into a function that takes the
// same parameters but returns a promise.
const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);
const glob = util.promisify(globCB);

// Function to remove the elements of array2 from array1 and return the resulting array
const removeFromArray = (array1, array2) =>
  array1.filter((element) => !array2.includes(element));

// Function to read the file content en return it
const readDataFromFile = async (pathToFile) => {
  try {
    const buffer = await readFile(pathToFile);
    return buffer.toString('utf8');
  } catch (error) {
    return '';
  }
};

// Function returning a date to ISO standard from the path of a file/folder
const getDateFromFileDirectory = (pathToFolder) => {
  const [directoryDate] = pathToFolder.match(/(\d{4})+.{12}/g);
  const splitDirectoryDate = directoryDate.split('/');
  const [hours, minutes] = splitDirectoryDate[3].split('h');
  const [years, months, days] = splitDirectoryDate;
  // months start from 0 (january) in JS
  const date = new Date(years, months - 1, days, hours, minutes);
  return date.toISOString();
};

// Function returning wether a folder is empty or not
const isDirNotEmpty = async (folder) => {
  const dir = await readDir(folder);
  return dir.length !== 0;
};

// checks if a givent folder already exists in the database
const unprocessedFolders = async (folder, timestampsInDB) =>
  !(await timestampsInDB[getDateFromFileDirectory(folder)]);

// Function to filter an array asynchronously
const asyncFilter = async (items, predicate) => {
  const boolTable = await Promise.all(items.map(predicate));
  return items.filter((_, index) => boolTable[index]);
};

// Function to parse the sensors' list from the geometrie file
// There are different file format thus, we sometimes need to JSON.parse(JSON.parse(data))
const parseSensorList = async (folder) => {
  try {
    const data = await readDataFromFile(`${folder}/geometrie.json`);
    const firstParse = JSON.parse(data);
    const object =
      typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
    return object;
  } catch (error) {
    console.error(
      `There was an error with the data from ${folder}/geometrie.json`
    );
    return {};
  }
};

// Function to parse the sensors' satuts
const parseSensorStatus = async (folder) => {
  try {
    const data = await readDataFromFile(`${folder}/statut_stations.log`);
    const firstParse = JSON.parse(data);
    const object =
      typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
    return object;
  } catch (error) {
    console.error(
      `There was an error with the data from ${folder}/statut_stations.log`
    );
    return {};
  }
};

// Function to pad a number with a zero if it's less than 10
const padNumber = (number) => (number < 10 ? `0${number}` : number);

// Function to save one experiment, and its sensors and their status
const saveExperimentSensorsAndStatus = async (folder) => {
  const timestamp = new Date(getDateFromFileDirectory(folder));
  // Save the experiment in the DB
  const experiment = await ExperimentModel.create({
    timestamp: timestamp.toISOString(),
    neuralNetworkLog: await readDataFromFile(
      `${folder}/inference_${timestamp.getFullYear()}_${padNumber(
        timestamp.getMonth() + 1
      )}_${padNumber(timestamp.getDate())}_${padNumber(
        timestamp.getHours()
      )}h${padNumber(timestamp.getMinutes())}.log`
    ),
    assimilationLog: await readDataFromFile(`${folder}/bash_assim.log`),
    // need to check for the rain graph source file
    rainGraph: `${folder}/fig.png`,
    rainMap: `${folder}/champs_assim_t3.png`,
    costGraph: `${folder}/diagnostics.png`,
    parameters: await readDataFromFile(`${folder}/config.cfg`),
    locationId: 1,
  });
  // From the saved experiment, grab its ID (with locationId) and use them to save the list of sensors if not already present in the DB
  const experimentId = experiment.id;
  const sensors = await parseSensorList(folder);
  const sensorNumberList = Object.keys(sensors).map(Number);
  // Get all the sensors in the DB with locationId
  const sensorList = await SensorModel.findAllFromLocation(1);

  const newSensors = removeFromArray(
    sensorNumberList,
    sensorList.map((sensor) => sensor.sensorNumber)
  );
  // Save the sensors to the DB
  await Promise.all(
    newSensors.map(async (number) => {
      try {
        SensorModel.create({
          experimentId,
          locationId: 1,
          sensorNumber: number,
          spotName: sensors[number]?.lieux || '',
          lat: sensors[number]?.latitude || 0,
          lng: sensors[number]?.longitude || 0,
          createAt: experiment.timestamp,
        });
      } catch (err) {
        console.error(err);
      }
    })
  );
  // Get all sensors of a location from the DB
  const sensorsAtLocation = await SensorModel.findAllFromLocation(1);
  const sensorsStatus = await parseSensorStatus(folder);
  // Save the status of the sensors in the DB
  return Promise.all(
    sensorsAtLocation.map(async (sensor) => {
      const { sensorNumber, id } = sensor;
      const status = sensorsStatus[sensorNumber];
      return StatusModel.create({
        // If no status was specified in the file, the status is 'offline'
        code: status || 0,
        sensorId: id,
        experimentId,
      });
    })
  );
};

// Main function to save of the files info to the DB
const saveDataToDB = async (pathToFiles) => {
  try {
    const folders = await glob(pathToFiles);
    const timestampsInDB = await ExperimentModel.getAllTimestamps();
    const pathTable = await Promise.all(
      await asyncFilter(await asyncFilter(folders, isDirNotEmpty), (folder) =>
        unprocessedFolders(folder, timestampsInDB)
      )
    );

    await pathTable.reduce(async (accumulator, path) => {
      await accumulator;
      return saveExperimentSensorsAndStatus(path);
    }, Promise.resolve());
  } catch (error) {
    console.error(error);
  }
};

module.exports = saveDataToDB;
