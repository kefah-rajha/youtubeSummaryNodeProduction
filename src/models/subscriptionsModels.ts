import mongoose, { Schema } from 'mongoose';

// TypeScript interface to represent the structure of a subscription document.
export interface ISubscription {
  user: string;
  paddleSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing' | 'ended';
  planId: string;
  planName: string;
  priceId: string;
  productId: string;
  productName: string;
  transactionId: string;
  currency: string;
  amount: number;
  billingCycle: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
  };
  startDate: Date;
  nextBillingDate?: Date;
  endDate?: Date;
  canceledAt?: Date;
  pausedAt?: Date;
  trialEnd?: Date;
  customData?: {
    user_id?: string;
    internal_user_id?: string;
    [key: string]: any;
  };
  items: Array<{
    priceId: string;
    productId: string;
    quantity: number;
    amount: number;
  }>;
  history: Array<{
    eventType: string;
    eventDate: Date;
    changes: Record<string, any>;
    metadata?: Record<string, any>;
  }>;
}

// Mongoose schema for the Subscription model.
const SubscriptionSchema = new Schema<ISubscription>({
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
  customData: Schema.Types.Mixed,
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
    changes: Schema.Types.Mixed,
    metadata: Schema.Types.Mixed
  }]
}, {
  // Automatically adds `createdAt` and `updatedAt` fields.
  timestamps: true
});

// Exports the Mongoose model for the 'Subscription' collection.
export const Subscriptions = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);