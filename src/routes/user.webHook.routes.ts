
import express, { Express, Request, Response } from "express";
const router = express.Router()
import { auth } from "../controllers/auth"
import { subscriptionHandle } from "../controllers/subscriptionHandle"

router.post('/user', express.raw({ type: 'application/json' }), auth.userOperation);
router.post('/webhookPaddle', express.raw({ type: 'application/json' }), subscriptionHandle.paddleWebHookHandler);
export default router
