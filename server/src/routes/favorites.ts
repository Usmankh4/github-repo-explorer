import { response, Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { prisma } from "../db.js";
import { Prisma } from "../generated/prisma/client.js";

const favoriteRouter = Router();

favoriteRouter.get("/", authenticateToken, async (request, response) => {
  const userId = request.userId;

  if (userId === undefined) {
    return response.status(401).json({ message: "Authentication required" });
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
      language: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  return response.status(200).json(favorites);
});

favoriteRouter.post("/", authenticateToken, async (request, response) => {
  const userId = request.userId;
  if (userId === undefined) {
    return response.status(401).json({ message: "Authentication required" });
  }

  const body: unknown = request.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return response.status(400).json({
      message: "Invalid favorite",
    });
  }

  if (
    !("repoId" in body) ||
    typeof body.repoId !== "string" ||
    body.repoId.trim().length === 0 ||
    !("name" in body) ||
    typeof body.name !== "string" ||
    body.name.trim().length === 0 ||
    !("description" in body) ||
    (typeof body.description !== "string" && body.description !== null) ||
    !("starCount" in body) ||
    typeof body.starCount !== "number" ||
    !Number.isSafeInteger(body.starCount) ||
    body.starCount < 0 ||
    !("url" in body) ||
    typeof body.url !== "string" ||
    body.url.trim().length === 0 ||
    !("language" in body) ||
    (typeof body.language !== "string" && body.language !== null)
  ) {
    return response.status(400).json({
      message: "Invalid favorite",
    });
  }

  const repoId = body.repoId.trim();
  const name = body.name.trim();
  const description = body.description === null || body.description.trim().length === 0 ? null : body.description.trim();
  const starCount = body.starCount;
  const url = body.url.trim();
  const language = body.language === null || body.language.trim().length === 0 ? null : body.language.trim();

  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.hostname !== "github.com"
    ) {
      return response.status(400).json({
        message: "Invalid favorite",
      });
    }
  } catch {
    return response.status(400).json({
      message: "Invalid favorite",
    });
  }

  try {
    const createdFavorite = await prisma.favorite.create({
      data: {
        repoId,
        name,
        description,
        starCount,
        url,
        language,
        userId,
      },
      select: {
        id: true,
        repoId: true,
        name: true,
        description: true,
        starCount: true,
        url: true,
        language: true,
      },
    });

    return response.status(201).json(createdFavorite);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return response.status(409).json({
        message: "Repository already saved",
      });
    }

    throw error;
  }
});
favoriteRouter.delete("/:id", authenticateToken, async (request, response) => {
    const userId = request.userId;

    if(userId === undefined){
        return response.status(401).json({message: "Authentication required"})
    }
    const favoriteId = Number(request.params.id);

    if (!Number.isSafeInteger(favoriteId) || favoriteId <= 0) {
        return response.status(400).json({
          message: "Invalid favorite ID",
        });
      }

      const deletionResult = await prisma.favorite.deleteMany({
        where: {
            id: favoriteId,
            userId
        }
      })
      if(deletionResult.count === 0){
        return response.status(404).json({
            message: "Favorite not found"
        })
      }

      return response.status(200).send();

})

export { favoriteRouter };
