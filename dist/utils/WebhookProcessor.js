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
exports.webhookProcessor = void 0;
const subscriptionsModels_1 = require("../models/subscriptionsModels");
const user_auth_1 = __importDefault(require("../models/user.auth"));
const paddleWebHookDataEventHandler_1 = require("../utils/paddleWebHookDataEventHandler");
/**
 * Creates a webhook processor for handling events from the Paddle payment gateway.
 * This factory function encapsulates the logic for different event types.
 */
function createWebhookProcessor() {
    /**
     * Handles the 'subscription.created' webhook event.
     * This function saves the new subscription to the database and updates the user's record.
     * @param eventData The raw event data string from Paddle.
     */
    function handleSubscriptionCreated(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Parse the incoming event data into a structured ISubscription object.
            const subscriptionData = (0, paddleWebHookDataEventHandler_1.parsePaddleSubscription)(eventData);
            console.log(subscriptionData.user, "subscriptionData");
            try {
                if (subscriptionData.user) {
                    // Create a new subscription document in the database.
                    const subscription = new subscriptionsModels_1.Subscriptions(Object.assign({}, subscriptionData));
                    const subscriptionAfterSave = yield subscription.save();
                    console.log(subscriptionAfterSave.user, "subscriptionAfterSave Id");
                    console.log(subscriptionAfterSave.user, "subscriptionAfterSave user");
                    // Find the user and link the newly created subscription to their profile.
                    // We use `clerkId` to find the user and set `currentSubscriptionId` to the new subscription's ID.
                    const updateSubscriptionUser = yield user_auth_1.default.updateOne({ clerkId: subscriptionAfterSave.user }, { $set: { currentSubscriptionId: subscriptionAfterSave._id } }, { runValidators: true });
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    /**
     * Handles the 'subscription.updated' webhook event.
     * @param data The event data from Paddle.
     */
    function handleSubscriptionUpdated(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Subscription updated:');
            // Implement your business logic here for when a subscription is updated.
        });
    }
    /**
     * Handles the 'subscription.cancelled' webhook event.
     * @param data The event data from Paddle.
     */
    function handleSubscriptionCancelled(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Subscription cancelled:');
            // Implement your business logic here for when a subscription is cancelled.
        });
    }
    /**
     * Handles the 'payment.succeeded' webhook event.
     * @param data The event data from Paddle.
     */
    function handlePaymentSucceeded(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Payment succeeded:');
            // Implement your business logic here for a successful payment.
        });
    }
    /**
     * The main function to process incoming webhook events based on their type.
     * @param event The webhook event object from Paddle.
     */
    function processEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            // Serialize the event object to a string for logging or further processing.
            const data = JSON.stringify(event, null, 2);
            // Use a switch statement to route events to the appropriate handler function.
            switch (event.eventType) {
                case 'subscription.created':
                    yield handleSubscriptionCreated(data);
                    break;
                case 'subscription.updated':
                    yield handleSubscriptionUpdated(event.data);
                    break;
                case 'subscription.cancelled':
                    yield handleSubscriptionCancelled(event.data);
                    break;
                case 'payment.succeeded':
                    yield handlePaymentSucceeded(event.data);
                    break;
                default:
                    // Log a warning for any event types that are not handled.
                    console.warn(`Unhandled event type: ${event.eventType}`);
            }
        });
    }
    // Return the public interface of the processor.
    return {
        processEvent
    };
}
// Create and export a single instance of the webhook processor.
exports.webhookProcessor = createWebhookProcessor();
