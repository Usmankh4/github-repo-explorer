import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {prisma} from "../db.js"

const favoriteRouter = Router();

favoriteRouter.get("/", authenticateToken, async (request, response) => {
    const userId = request.userId;

    if(userId === undefined){
        return response.status(401).json({ message: "Authentication required"})
    }
    const favorites = await prisma.favorite.findMany({
        where: {
            userId,
        },
        select: {
            id: true,
            repoId: true,
            name: true,
            description: true,
            starCount: true,
            url: true,
            language: true
        },
         orderBy:{
            id: "desc"
         }

    })

    return response.status(200).json(favorites);

})

export {favoriteRouter};