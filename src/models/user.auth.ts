import mongoose, { Schema, Document } from 'mongoose';

// Interface defining the basic structure of a user document.
export interface IUserBase {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  settings?: Record<string, any>;
  paddleCustomerId?: string;
  freeTrialEnd?: Date | null;
  lifeTimeDeal?: boolean;
  currentSubscriptionId?: mongoose.Types.ObjectId | null;
}

// Mongoose schema for the User model.
const UserSchema = new Schema<IUserBase>({
  // Unique ID from Clerk authentication service. Required for user identification.
  clerkId: { type: String, required: true, unique: true },
  // User's email address.
  email: { type: String, required: true },
  // Optional first name of the user.
  firstName: String,
  // Optional last name of the user.
  lastName: String,
  // A mixed type object to store various user settings. Defaults to an empty object.
  settings: {
    type: Schema.Types.Mixed,
    default: {}
  },
  // Customer ID from Paddle, a payment processing platform.
  paddleCustomerId: { type: String, default: null },
  // The end date of the user's free trial.
  freeTrialEnd: { 
    type: Date,  
    default: () => {
      // Sets the free trial end date to 7 days from the creation date.
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
    nullable: true
  }, 
  // A boolean to indicate if the user has a lifetime deal.
  lifeTimeDeal: { type: Boolean, default: false },
  // A reference to the user's current subscription document.
  currentSubscriptionId: { 
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  }
}, {
  // Adds `createdAt` and `updatedAt` timestamps automatically.
  timestamps: true
});

// Exports the Mongoose model for the 'User' collection.
export default mongoose.model<IUserBase>('User', UserSchema);