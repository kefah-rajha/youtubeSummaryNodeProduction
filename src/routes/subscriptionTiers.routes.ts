import express from 'express';
import { tier } from '../controllers/subscriptionsTiers';


const router = express.Router();

router.get('/tiers', tier.getTiers);
router.get('/tiers/:id', tier.getTier);
router.put('/UpdateTiers/:id', tier.updateTier);

router.get('/create', (req:any,res:any)=>{
    res.json({message:"test"})
})
export default router;
