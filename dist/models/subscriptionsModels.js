"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriptions = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Mongoose schema for the Subscription model.
const SubscriptionSchema = new mongoose_1.Schema({
    // The user ID associated with the subscription.
    user: {
        type: String,
        required: true
    },
    // The unique subscription ID from the Paddle platform.
    paddleSubscriptionId: {
        type: String,
        required: true,
        unique: true
    },
    // The current status of the subscription.
    status: {
        type: String,
        enum: ['active', 'canceled', 'past_due', 'paused', 'trialing', 'ended'],
        required: true
    },
    // The ID of the subscription plan.
    planId: { type: String, required: true },
    // The name of the subscription plan.
    planName: { type: String, required: true },
    // The ID of the price.
    priceId: { type: String, required: true },
    // The ID of the product.
    productId: { type: String, required: true },
    // The name of the product.
    productName: { type: String, required: true },
    // The ID of the most recent transaction.
    transactionId: { type: String, required: true },
    // The currency used for the subscription (e.g., USD).
    currency: { type: String, required: true },
    // The amount of the subscription.
    amount: { type: Number, required: true },
    // Details about the billing cycle.
    billingCycle: {
        interval: {
            type: String,
            enum: ['day', 'week', 'month', 'year'],
            required: true
        },
        frequency: { type: Number, required: true }
    },
    // The date the subscription started.
    startDate: { type: Date, required: true },
    // The date of the next billing event.
    nextBillingDate: Date,
    // The date the subscription will end.
    endDate: Date,
    // The date the subscription was canceled.
    canceledAt: Date,
    // The date the subscription was paused.
    pausedAt: Date,
    // The date the trial period ends.
    trialEnd: Date,
    // Optional custom data related to the subscription.
    customData: mongoose_1.Schema.Types.Mixed,
    // An array of items included in the subscription.
    items: [{
            priceId: String,
            productId: String,
            quantity: Number,
            amount: Number
        }],
    // A historical record of changes to the subscription.
    history: [{
            eventType: String,
            eventDate: { type: Date, default: Date.now },
            changes: mongoose_1.Schema.Types.Mixed,
            metadata: mongoose_1.Schema.Types.Mixed
        }]
}, {
    // Automatically adds `createdAt` and `updatedAt` fields.
    timestamps: true
});
// Exports the Mongoose model for the 'Subscription' collection.
exports.Subscriptions = mongoose_1.default.model('Subscription', SubscriptionSchema);
