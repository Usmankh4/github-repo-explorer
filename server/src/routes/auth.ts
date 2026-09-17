import { Router } from "express";
import {prisma} from "../db.js"
import bcrypt from 'bcrypt';
import { Prisma } from "../generated/prisma/client.js";
import jwt from "jsonwebtoken"
import { env } from "../config/env.js";
const authRouter = Router();



authRouter.post("/register", async (req,res) => {

    const body: unknown = req.body;

    if(typeof body !== "object" || body === null || Array.isArray(body) ){
        return res.status(400).json({message: "Invalid username or password"});
    }

    if(!("username" in body) || typeof body.username !== "string" || !("password" in body) || typeof body.password !== "string"){
        return res.status(400).json({
            message: "Invalid username or password",
        })
    }
    const username = body.username.trim();
    const password = body.password;
    if(username.length === 0 || password.length < 8 ){
        return res.status(400).json({message: "Invalid username or password"})
    }

    const hashedPassword = await bcrypt.hash(password, 12);

   try{
    const createdUser = await prisma.user.create({
        data: {
            username: username,
            hashedPassword: hashedPassword
        },
        select: {
            id: true,
            username: true,
        }
    })
    return res.status(201).json(createdUser);

   }catch(error: unknown){
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
        return res.status(409).json({message: "Username already exists",})
    }
    throw error;
   }

})


authRouter.post("/login", async (req,res) =>{

    const body: unknown = req.body;

    if(typeof body !== "object" || body === null || Array.isArray(body)){
        return res.status(400).json({message: "Invalid username or password"})
    }
    if(!("username" in body) || !("password" in body) || typeof body.username !== "string" || typeof body.password !== "string" ){
        return res.status(400).json({message: "Invalid username or password"})
    }

    const username = body.username.trim();
    const password = body.password;

    if(username.length === 0 || password.length < 8){
        return res.status(400).json({message: "Invalid username or password"});
    }

    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true,
            username: true,
            hashedPassword: true,
        }
    })
    if(user === null){
        return res.status(401).json({message: "Invalid username or password"})
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if(!isPasswordCorrect){
        return res.status(401).json({message: "Invalid username or password"})
    }

    const token = jwt.sign({
    userId: user.id
    }, env.jwtSecret, {expiresIn: "1h"})

    return res.status(200).json(
        {
            id: user.id,
            username: user.username,
            token
        }
    )

})

export {authRouter}