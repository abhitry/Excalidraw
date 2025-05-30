import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from "./middleware.js";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors())

app.get("/",(req,res)=>{
    res.json({
        "msg":"Done"
    });
})

app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    const password=parsedData.data?.password;

    if (!parsedData.success || !password) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                password: hashedPassword,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})

app.post("/signin", async (req:any, res:any) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    const password=parsedData.data.password;
    try{
        const user = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.username
            }
        })
        
        if (!user) {
            res.status(403).json({
                message: "Not authorized"
            })
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const token = jwt.sign({
            userId: user?.id
        }, JWT_SECRET);

        res.json({
            token
        })
    }   
    catch(err)
    {
        console.error("Signin error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/chats/:roomId",async(req,res)=>{
    try{
        const roomId=Number(req.params.roomId);
        const messages=await prismaClient.chat.findMany({
            where:{
                roomId:roomId
            },
            orderBy:{
                id:"desc"
            }
            ,take:50
        });
        res.json({
            messages
        })
    }
    catch(err){
        res.json({
            messages:[]
        })
    }
})


app.get("/room/:slug",async(req,res)=>{
    const slug=req.params.slug;
    const roomId=await prismaClient.room.findFirst({
        where:{
            slug
        }
    });
    res.json({
        roomId
    })
})

app.listen(3001);