import User from '../models/user.auth.js';
import 'dotenv/config';
import { paddle } from "../config/paddle.js";
import { webhookProcessor } from "../utils/WebhookProcessor";
import { getAuth } from '@clerk/express';
import { Subscriptions } from "../models/subscriptionsModels";
import mongoose from 'mongoose';

export const subscriptionHandle = {

    // Controller to handle webhooks from Paddle.
    paddleWebHookHandler: async (req: any, res: any) => {
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
            const eventData = await paddle.webhooks.unmarshal(rawRequestBody, privateKey, signature);
            const eventName = eventData?.eventType || 'Unknown event';

            // Process the received event.
            if (eventData) {
                try {
                    await webhookProcessor.processEvent(eventData);
                } catch (processError) {
                    console.error('Error processing event:', processError);
                }
            }

            // Respond with a success status.
            res.status(200).json({ status: 'success', eventName });
        } catch (e: unknown) {
            let errorMessage: string;
            if (e instanceof Error) {
                errorMessage = e.message;
            } else {
                errorMessage = String(e);
            }
            console.error('Webhook processing failed:', {
                error: errorMessage,
                signature: signature.substring(0, 30) + '...',
                bodySnippet: rawRequestBody.substring(0, 100) + '...'
            });

            res.status(401).json({ error: 'Invalid signature or request' });
        }
    },

    // Controller to handle canceling a subscription.
    cancelSubscription: async (req: any, res: any) => {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        try {
            // Authenticate the user with Clerk.
            const { userId } = getAuth(req);

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Find the user in the database.
            const user = await User.findOne({ clerkId: userId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find the user's current subscription.
            const subscription = await Subscriptions.findById(user.currentSubscriptionId);
            if (!subscription) {
                return res.status(404).json({ message: 'Subscription not found' });
            }

            // Send a cancellation request to Paddle.
            const paddleResponse = await fetch(
                `https://api.paddle.com/subscriptions/${subscription.paddleSubscriptionId}/cancel`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        effective_from: 'immediately'
                    })
                }
            );

            // Handle Paddle API errors.
            if (!paddleResponse.ok) {
                const errorData = await paddleResponse.json();
                throw new Error(errorData.error?.message || 'Failed to cancel subscription with Paddle');
            }

            const paddleData = await paddleResponse.json();

            // Start a MongoDB transaction to ensure data consistency.
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // 1. Update the subscription status in the database.
                const updatedSubscription = await Subscriptions.findByIdAndUpdate(
                    subscription._id,
                    {
                        status: 'canceled',
                        canceledAt: new Date(),
                        endDate: new Date(),
                        nextBillingDate: null
                    },
                    { new: true, session }
                );

                // 2. Update the user to remove the subscription reference.
                await User.findOneAndUpdate(
                    { clerkId: userId },
                    { $set: { currentSubscriptionId: null } },
                    { session }
                );

                // Commit the transaction if everything is successful.
                await session.commitTransaction();

                return res.status(200).json({
                    success: true,
                    message: 'Subscription successfully canceled',
                    data: {
                        paddleResponse: paddleData,
                        subscription: updatedSubscription
                    }
                });

            } catch (dbError) {
                // Abort the transaction if any database operation fails.
                await session.abortTransaction();
                throw dbError;
            } finally {
                // End the session regardless of the outcome.
                session.endSession();
            }

        } catch (error) {
            console.error('Error cancelling subscription:', error);

            // Handle and return custom error responses.
            const errorResponse = handleSubscriptionError(error);
            return res.status(errorResponse.status).json(errorResponse);
        }
    }
};

// Helper function to handle and format errors.
function handleSubscriptionError(error: any) {
    let status = 500;
    let message = 'Internal server error';
    let details = null;

    if (error.message.includes('Failed to cancel subscription')) {
        status = 502;
        message = 'Failed to communicate with payment service';
    } else if (error instanceof mongoose.Error.ValidationError) {
        status = 400;
        message = 'Invalid data';
    } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
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

export default subscriptionHandle;