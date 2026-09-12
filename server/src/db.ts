import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if(!connectionString){
    throw new Error('Connection String is incorrect');
}

const adapter = new PrismaPg({
    connectionString: connectionString,
})

const prisma = new PrismaClient({ adapter});

export { prisma}