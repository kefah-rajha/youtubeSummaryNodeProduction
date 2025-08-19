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
const mongoose_1 = __importStar(require("mongoose"));
// Mongoose schema for the User model.
const UserSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subscription',
        default: null
    }
}, {
    // Adds `createdAt` and `updatedAt` timestamps automatically.
    timestamps: true
});
// Exports the Mongoose model for the 'User' collection.
exports.default = mongoose_1.default.model('User', UserSchema);
