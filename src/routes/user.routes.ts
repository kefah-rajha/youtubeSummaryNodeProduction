
import express, { Express, Request, Response } from "express";
const router = express.Router()
import { auth } from "../controllers/auth"
import { user } from "../controllers/user"

router.get('/user/getUser/:id', auth.getUser);
router.post("/getUsers/:pageNumber/:pageSize", user.getAllUsers)


export default router
