
// database.js (for Prisma)
// Import PrismaClient from the Prisma Client package
const { PrismaClient } = require('@prisma/client');

// Instantiate PrismaClient
const prisma = new PrismaClient();

// Export the prisma instance to be used in other files
module.exports = { prisma };
