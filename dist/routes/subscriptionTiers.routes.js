"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriptionsTiers_1 = require("../controllers/subscriptionsTiers");
const router = express_1.default.Router();
router.get('/tiers', subscriptionsTiers_1.tier.getTiers);
router.get('/tiers/:id', subscriptionsTiers_1.tier.getTier);
router.put('/UpdateTiers/:id', subscriptionsTiers_1.tier.updateTier);
router.get('/create', (req, res) => {
    res.json({ message: "test" });
});
exports.default = router;
