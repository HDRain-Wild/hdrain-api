const { prisma: db } = require('../db');

const delay = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

(async function main() {
  let connectionOK = false;
  console.log('waiting for db to be ready...');
  while (!connectionOK) {
    try {
      await db.$connect();
      connectionOK = true;
    } catch (e) {
      console.error(e);
      await delay(1);
    }
  }
  await db.$disconnect();
  await process.exit(0);
})();
