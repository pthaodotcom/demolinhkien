const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
prisma.$connect()
  .then(() => {
    console.log('DB CONNECTION SUCCESSFUL!');
    process.exit(0);
  })
  .catch((err) => {
    console.log('DB CONNECTION FAILED:', err.message);
    process.exit(0);
  });
