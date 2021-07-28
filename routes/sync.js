const syncRouter = require('express').Router();
const copyData = require('../scripts/copyScript');
const saveDataToDB = require('../scripts/readFile');

// Path to scan
const mainPath = `${process.env.LOCAL_TARGET}/**/[0-9][0-9]h[0-9][0-9]`;

let copyStartedAt = null;

syncRouter.get('/', async (req, res) => {
  if (!copyStartedAt) {
    try {
      copyStartedAt = new Date();
      res.status(200).send(`Sync started at ${copyStartedAt.toLocaleString()}`);
      await copyData();
      await saveDataToDB(mainPath);
      copyStartedAt = null;
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  } else {
    res
      .status(200)
      .send(`A copy is currently under way. It started at ${copyStartedAt}`);
  }
});

module.exports = syncRouter;
