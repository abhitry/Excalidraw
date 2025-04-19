import { NextFunction,Request, Response} from "express";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common/config"

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
}

export function authMiddleware(req:Request,res:Response,next:NextFunction)
{
    const authHeader=req.headers["authorization"]??"";
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Forbidden" });
    }
    const token = authHeader.split(' ')[1];
    try{
        
        const decoded = jwt.verify(token, JWT_SECRET) ;
        req.userId=(decoded).userId;
        next();
    }
    catch(err)
    {
        return res.status(403).json({});
    }
}

module.exports = {
    authMiddleware
}