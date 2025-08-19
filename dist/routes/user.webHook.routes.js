"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../controllers/auth");
const subscriptionHandle_1 = require("../controllers/subscriptionHandle");
router.post('/user', express_1.default.raw({ type: 'application/json' }), auth_1.auth.userOperation);
router.post('/webhookPaddle', express_1.default.raw({ type: 'application/json' }), subscriptionHandle_1.subscriptionHandle.paddleWebHookHandler);
exports.default = router;
