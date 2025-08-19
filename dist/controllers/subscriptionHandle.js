"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionHandle = void 0;
const user_auth_js_1 = __importDefault(require("../models/user.auth.js"));
require("dotenv/config");
const paddle_js_1 = require("../config/paddle.js");
const WebhookProcessor_1 = require("../utils/WebhookProcessor");
const express_1 = require("@clerk/express");
const subscriptionsModels_1 = require("../models/subscriptionsModels");
const mongoose_1 = __importDefault(require("mongoose"));
exports.subscriptionHandle = {
    // Controller to handle webhooks from Paddle.
    paddleWebHookHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const signature = req.headers['paddle-signature'] || '';
        const rawRequestBody = req.body;
        const privateKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || '';
        try {
            // Verify that all necessary data is present.
            if (!signature || !rawRequestBody || !privateKey) {
                console.error('Missing required data for webhook verification');
                return res.status(400).json({ error: 'Bad request' });
            }
            // Unmarshal and verify the webhook event data.
            const eventData = yield paddle_js_1.paddle.webhooks.unmarshal(rawRequestBody, privateKey, signature);
            const eventName = (eventData === null || eventData === void 0 ? void 0 : eventData.eventType) || 'Unknown event';
            // Process the received event.
            if (eventData) {
                try {
                    yield WebhookProcessor_1.webhookProcessor.processEvent(eventData);
                }
                catch (processError) {
                    console.error('Error processing event:', processError);
                }
            }
            // Respond with a success status.
            res.status(200).json({ status: 'success', eventName });
        }
        catch (e) {
            let errorMessage;
            if (e instanceof Error) {
                errorMessage = e.message;
            }
            else {
                errorMessage = String(e);
            }
            console.error('Webhook processing failed:', {
                error: errorMessage,
                signature: signature.substring(0, 30) + '...',
                bodySnippet: rawRequestBody.substring(0, 100) + '...'
            });
            res.status(401).json({ error: 'Invalid signature or request' });
        }
    }),
    // Controller to handle canceling a subscription.
    cancelSubscription: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }
        try {
            // Authenticate the user with Clerk.
            const { userId } = (0, express_1.getAuth)(req);
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            // Find the user in the database.
            const user = yield user_auth_js_1.default.findOne({ clerkId: userId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Find the user's current subscription.
            const subscription = yield subscriptionsModels_1.Subscriptions.findById(user.currentSubscriptionId);
            if (!subscription) {
                return res.status(404).json({ message: 'Subscription not found' });
            }
            // Send a cancellation request to Paddle.
            const paddleResponse = yield fetch(`https://api.paddle.com/subscriptions/${subscription.paddleSubscriptionId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    effective_from: 'immediately'
                })
            });
            // Handle Paddle API errors.
            if (!paddleResponse.ok) {
                const errorData = yield paddleResponse.json();
                throw new Error(((_a = errorData.error) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to cancel subscription with Paddle');
            }
            const paddleData = yield paddleResponse.json();
            // Start a MongoDB transaction to ensure data consistency.
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                // 1. Update the subscription status in the database.
                const updatedSubscription = yield subscriptionsModels_1.Subscriptions.findByIdAndUpdate(subscription._id, {
                    status: 'canceled',
                    canceledAt: new Date(),
                    endDate: new Date(),
                    nextBillingDate: null
                }, { new: true, session });
                // 2. Update the user to remove the subscription reference.
                yield user_auth_js_1.default.findOneAndUpdate({ clerkId: userId }, { $set: { currentSubscriptionId: null } }, { session });
                // Commit the transaction if everything is successful.
                yield session.commitTransaction();
                return res.status(200).json({
                    success: true,
                    message: 'Subscription successfully canceled',
                    data: {
                        paddleResponse: paddleData,
                        subscription: updatedSubscription
                    }
                });
            }
            catch (dbError) {
                // Abort the transaction if any database operation fails.
                yield session.abortTransaction();
                throw dbError;
            }
            finally {
                // End the session regardless of the outcome.
                session.endSession();
            }
        }
        catch (error) {
            console.error('Error cancelling subscription:', error);
            // Handle and return custom error responses.
            const errorResponse = handleSubscriptionError(error);
            return res.status(errorResponse.status).json(errorResponse);
        }
    })
};
// Helper function to handle and format errors.
function handleSubscriptionError(error) {
    let status = 500;
    let message = 'Internal server error';
    let details = null;
    if (error.message.includes('Failed to cancel subscription')) {
        status = 502;
        message = 'Failed to communicate with payment service';
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError) {
        status = 400;
        message = 'Invalid data';
    }
    else if (error instanceof mongoose_1.default.Error.DocumentNotFoundError) {
        status = 404;
        message = 'Required document not found';
    }
    // Include detailed error information in development mode.
    if (process.env.NODE_ENV === 'development') {
        details = {
            message: error.message,
            stack: error.stack
        };
    }
    return { status, message, details };
}
exports.default = exports.subscriptionHandle;
