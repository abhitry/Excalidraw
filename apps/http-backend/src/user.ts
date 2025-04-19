import express =require("express");
import jwt from "JsonWebToken";
const router=express.Router();
const zod = require("zod");
import {JWT_SECRET} from "@repo/backend-common/config"
import { authMiddleware } from "./middleware";
import {CreateUserSchema,SigninSchema,CreateRoomSchema} from "@repo/common/types"
import { prismaClient } from "@repo/db/client";

router.post("/signup",async(req,res)=>{
    const parsedData=CreateUserSchema.safeParse(req.body);
    if(!parsedData.success)
    {
        res.json({
            message :"InCorrect Format of Input"
        })
        return;
    }
    try{//fail if someone try to signup using an existing user AS EMAIL IS UNIQUE
        await prismaClient.user.create({
            data:{
                username:parsedData.data?.username,
                password:parsedData.data.password,
                name:parsedData.data.name
            }
        });
    
        res.json({
            message:"User Created Successfully",
        })
    }
    catch(e)
    {
        res.status(411).json({
            "msg":"user already exits with this username"
        })
    }
    
})

router.post("/signin",(req,res)=>{
    const data=SigninSchema.safeParse(req.body);
    if(!data.success)
    {
        res.json({
            message :"InCorrect Format of Input"
        })
        return;
    }
}

router.post("/room",authMiddleware,(req,res)=>{
    
    const data=CreateRoomSchema.safeParse(req.body);
    if(!data.success)
    {
        res.json({
            message :"InCorrect Format of Input"
        })
        return;
    }
    //db call
    res.json({
        roomId:123
    })
}

export.exports=Router;