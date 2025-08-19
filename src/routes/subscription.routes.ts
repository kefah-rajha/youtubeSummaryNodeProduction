import express, { Express, Request, Response } from "express";

const router = express.Router()
import subscriptionHandle from "../controllers/subscriptionHandle"
router.post('/cancelSubscription ', subscriptionHandle.cancelSubscription)


export default router