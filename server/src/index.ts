import express from "express"
import bcrypt from "bcrypt"
import cors from "cors"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import type { Request, Response } from "express"
dotenv.config()
import type {User} from '@prisma/client'


type RequestRegisterBody = {
  username: string
  password: string
}

type RegisterResponse = Omit<User, "hashedPassword">

const app = express()
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
})
app.use(cors())

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Server running")
})

app.post("/auth/register", async (req:Request< {} ,RegisterResponse , RequestRegisterBody, {}>, res:Response<RegisterResponse>) => {

  const {username,password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const createUser = await prisma.user.create({
    data: {
      username,
      hashedPassword
    }
  })

  res.json({
    id: createUser.id,
    username: createUser.username
  })

})

app.listen(4000, () => console.log("Server on http://localhost:4000"))
