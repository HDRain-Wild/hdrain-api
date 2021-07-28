const { prisma } = require('../db');

const User = require('../models/UserModel');

module.exports = async function seed() {
  await User.create({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  });

  await prisma.location.create({
    data: {
      name: 'Abidjan',
      lng: -4.033333,
      lat: 5.316667,
    },
  });

  await prisma.location.create({
    data: {
      name: 'Antibes',
      lng: 7.125102,
      lat: 43.580418,
    },
  });

  await prisma.location.create({
    data: {
      name: 'Toulouse',
      lng: 1.433333,
      lat: 43.6,
    },
  });
};

module
  .exports()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
