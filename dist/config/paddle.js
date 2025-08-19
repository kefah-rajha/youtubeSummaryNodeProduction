"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paddle = void 0;
const paddle_node_sdk_1 = require("@paddle/paddle-node-sdk");
require("dotenv/config");
exports.paddle = new paddle_node_sdk_1.Paddle(process.env.PADDLE_API_KEY, {
    environment: paddle_node_sdk_1.Environment.sandbox, // or Environment.sandbox for accessing sandbox API
    logLevel: paddle_node_sdk_1.LogLevel.verbose, // or LogLevel.error for less verbose logging
    customHeaders: {
        'X-Custom-Header': 'value' // Optional custom headers
    }
});
