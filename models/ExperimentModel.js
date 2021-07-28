const { prisma } = require('../db');
const { API_BASE_URL } = require('../env');

const findExperimentByTimestamp = async (locationId, timestamp) =>
  prisma.experiment.findFirst({
    where: {
      locationId: parseInt(locationId, 10),
      timestamp,
    },
  });

const findLatestExperiment = async (locationId) =>
  prisma.experiment.findFirst({
    where: {
      locationId: parseInt(locationId, 10),
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 1,
  });

const getExperiment = (experiment) =>
  prisma.experiment.findFirst({
    where: { timestamp: experiment.timestamp },
  });

const create = async (exp) => {
  const {
    timestamp,
    neuralNetworkLog,
    assimilationLog,
    rainMap,
    costGraph,
    parameters,
    locationId,
  } = exp;

  const storingExp = await prisma.experiment.create({
    data: {
      timestamp,
      neuralNetworkLog,
      assimilationLog,
      rainMap,
      costGraph,
      parameters,
      locationId,
    },
  });

  return storingExp;
};

const update = (id, path) =>
  prisma.experiment.update({
    where: {
      id,
    },
    data: {
      rainMap: `${path}`,
    },
  });

// function to get all the info related to one experiment but also to extract the expected url
// if an url exist, make it precede of the localhost:5000 to get absolute url
const getImagesURL = (experiment) => {
  let rainMap = experiment ? experiment.rainMap : undefined;
  let costGraph = experiment ? experiment.costGraph : undefined;
  if (
    rainMap &&
    !rainMap.startsWith('http://') &&
    !rainMap.startsWith('https://')
  ) {
    rainMap = `${API_BASE_URL}/${rainMap}`;
  }
  if (
    costGraph &&
    !costGraph.startsWith('http://') &&
    !costGraph.startsWith('https://')
  ) {
    costGraph = `${API_BASE_URL}/${costGraph}`;
  }
  return {
    ...experiment,
    rainMap,
    costGraph,
  };
};

const selectFile = (id) =>
  prisma.experiment.findUnique({
    where: {
      id,
    },
    select: {
      rainMap: true,
    },
  });

const createManyExperiments = (array) =>
  prisma.experiment.createMany({
    data: array,
  });

// Get all timestamps returns an object with keys = every timestamp and values = true
const getAllTimestamps = async () => {
  const experiments = await prisma.experiment.findMany();
  return Object.fromEntries(
    experiments.map(({ timestamp }) => [timestamp.toISOString(), true])
  );
};

module.exports = {
  create,
  update,
  selectFile,
  getExperiment,
  getAllTimestamps,
  createManyExperiments,
  findExperimentByTimestamp,
  getImagesURL,
  findLatestExperiment,
};
