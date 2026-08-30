import express from "express"
import bcrypt from "bcrypt"
import cors from "cors"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import jwt from 'jsonwebtoken'
import type { Request, Response } from "express"
dotenv.config()
import type {User} from '@prisma/client'
import { NextFunction } from "express"


const envJwtSecret = process.env.JWT_SECRET
if (!envJwtSecret) {
  throw new Error("JWT_SECRET is not defined")
}
const JWT_SECRET: string = envJwtSecret

const app = express()

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
})
app.use(cors())

app.use(express.json())


type RegisterRequestBody = {
  username: string
  password: string
}

type LoginRequestBody ={
  username: string
  password: string
} 
type RegisterResponse = Omit<User, "hashedPassword">

type LoginResponse = Omit<User,'hashedPassword'> & {token:string}

type ErrorMessage = {
  message: string
}

interface AuthRequest<Tbody = unknown> extends Request<{},{}, Tbody, {}>{
  userId?: number;
}

type FavouriteRequestBody = {
  repoId: number
  name: string
  url : string
}

app.get("/", (req, res) => {
  res.send("Server running")
})

app.post("/auth/register", async (req:Request< {} ,RegisterResponse , RegisterRequestBody, {}>, res:Response<RegisterResponse>) => {


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


app.post("/auth/login", async(req:Request<{}, LoginResponse | ErrorMessage, LoginRequestBody, {} >,res:Response<LoginResponse | ErrorMessage>) =>{

  const {username, password} = req.body
  const findUser = await prisma.user.findUnique({
    where: {
      username: username
    }
  })

  if(!findUser){
    return res.status(404).json({message: "No user found"})
  }

  const passwordMatch = await bcrypt.compare(password, findUser.hashedPassword)
  if(!passwordMatch){
    return res.status(401).json({message: "Incorrect password"})
  }
  const token = jwt.sign(
    { userId: findUser.id },
    JWT_SECRET,
    { expiresIn: "1h" }
  )

  res.json({
    username: findUser.username,
    id: findUser.id,
    token
  })
})


function authenticateToken(req:AuthRequest,res:Response,next:NextFunction){
  
  const authHeader = req.headers.authorization;
  if(!authHeader){
   return res.status(401).json({message: "auth header does not exist"})
  }
  const [scheme, token ] = authHeader.split(" ")
  if(scheme !== "Bearer" || !token){
    return res.status(401).json({message: "Invalid authorization format"

    })
  }
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    if(typeof decoded === "string" || typeof decoded.userId !== "number"){
      return res.status(401).json({ 
        message: "Invalid Token"

        })
    }
    req.userId = decoded.userId;

    next()

  } catch(error){
    return res.status(401).json({
      message: "Invalid or expired token"
    })

  }

}

app.get("/user/favorites", authenticateToken, async (req:AuthRequest, res) => {
  if(req.userId=== undefined){
    return res.status(401).json({message: "User id is not a number"})
  }

  const favourites = await prisma.favorite.findMany({
    where: {
      userId: req.userId
    }
  })
  res.json(favourites);

})
app.post("/user/favorites", authenticateToken, async (req: AuthRequest<FavouriteRequestBody>, res:Response) => {

  const {repoId, name, url} = req.body
  if(req.userId === undefined){
    return res.status(401).json({message: 
      "User id is not a number"
    })
  }

  const userFavourites = await prisma.favorite.create({
    data:{
      repoId: repoId,
      name: name,
      url: url,
      userId: req.userId
    }

  })
  res.json(userFavourites);

})

app.listen(4000, () => console.log("Server on http://localhost:4000"))


