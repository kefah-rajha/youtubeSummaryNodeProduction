import { Schema, model, Document } from 'mongoose';

// TypeScript interface for the PriceId sub-document.
interface IPriceId {
  month: string;
  year: string;
}

// Main TypeScript interface for the Tier document.
// It extends Document to include Mongoose's built-in document properties.
export interface ITier extends Document {
  name: string;
  id: string;
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  priceId: IPriceId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for the PriceId sub-document.
// `_id: false` prevents Mongoose from creating a default `_id` for sub-documents.
const PriceIdSchema = new Schema<IPriceId>({
  month: {
    type: String,
    trim: true // Trims whitespace from the beginning and end of the string.
  },
  year: {
    type: String,
    trim: true
  }
}, { _id: false });

// Main Mongoose schema for the Tier model.
const TierSchema = new Schema<ITier>({
  // Name of the tier (e.g., 'Starter', 'Pro').
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true // Ensures the name is unique across all tier documents.
  },
  // Unique identifier for the tier, often used for programmatic access.
  id: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true // Creates an index for faster queries on this field.
  },
  // URL or name of the icon representing the tier.
  icon: {
    type: String,
    required: true,
    trim: true
  },
  // A brief description of the tier's purpose or value.
  description: {
    type: String,
    required: true,
    trim: true
  },
  // An array of features included in this tier.
  features: [{
    type: String,
    required: true,
    trim: true
  }],
  // A boolean to indicate if this tier should be highlighted as a featured option.
  featured: {
    type: Boolean,
    required: true,
    default: false
  },
  // Embedded sub-document for price IDs from a payment provider (e.g., Paddle).
  priceId: {
    type: PriceIdSchema,
    required: true
  }
}, {
  // `timestamps: true` adds `createdAt` and `updatedAt` fields automatically.
  timestamps: true,
  // Specifies the name of the MongoDB collection.
  collection: 'tiers'
});

// Create a sparse index on the `featured` field to optimize queries for featured tiers.
TierSchema.index({ featured: 1 });

// Export the Mongoose model for the 'Tier' collection.
export const Tier = model<ITier>('Tier', TierSchema);