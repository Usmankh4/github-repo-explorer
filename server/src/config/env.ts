import "dotenv/config";


const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }

const env ={
    jwtSecret,
}

export {env}