import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (
    error: unknown,
    _request,
    response,
    _next
) => {
     console.error(error)
    return response.status(500).json({
        message: "Internal server error",
    })

}

export {errorHandler}