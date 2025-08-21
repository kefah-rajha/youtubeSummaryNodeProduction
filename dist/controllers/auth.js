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
exports.auth = void 0;
const svix_1 = require("svix");
const user_auth_1 = __importDefault(require("../models/user.auth"));
require("dotenv/config");
console.log(process.env.CLERK_WEBHOOK_SECRET, "process.env.CLERK_WEBHOOK_SECRET");
exports.auth = {
    // Controller function to get a single user by their Clerk ID.
    getUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        console.log(id);
        try {
            // Find the user by their clerkId and populate the current subscription.
            const user = yield user_auth_1.default.find({ clerkId: id }).populate("currentSubscriptionId");
            // If no user is found, return a 400 Bad Request.
            if (!user) {
                return res.status(400).json({
                    message: "No User",
                    success: false
                });
            }
            // If the user is found, return the user data with a 200 OK status.
            res.status(200).json({
                data: user,
                success: true
            });
        }
        catch (error) {
            // Handle and return any server errors.
            res.status(500).json({
                message: error,
                success: false
            });
        }
    }),
    // Controller function to handle webhooks from Clerk.
    userOperation: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Extract Svix headers from the request.
        const svixHeaders = {
            'svix-id': req.headers['svix-id'],
            'svix-timestamp': req.headers['svix-timestamp'],
            'svix-signature': req.headers['svix-signature']
        };
        // Check for required headers.
        if (!svixHeaders['svix-id'] || !svixHeaders['svix-signature']) {
            return res.status(400).json({ error: 'Missing required headers' });
        }
        // Ensure the webhook secret is configured.
        if (!process.env.CLERK_WEBHOOK_SECRET) {
            console.error("❌ CLERK_WEBHOOK_SECRET is not defined in .env");
            return res.status(500).json({ error: "Server misconfiguration" });
        }
        // Initialize Svix webhook with the secret.
        const svixWebhook = new svix_1.Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
        console.log(svixWebhook, "svixWebhook", req.body);
        let payload;
        console.log('--- Raw Payload (Buffer) ---', payload);
        console.log('--- Headers ---', {
            svixId: svixHeaders['svix-id'],
            svixSignature: svixHeaders['svix-signature'],
        });
        // Verify the webhook signature to ensure it's from Clerk.
        try {
            payload = svixWebhook.verify(req.body, svixHeaders);
        }
        catch (err) {
            console.error('Error verifying webhook:', err);
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }
        // Destructure the payload to get the event type and data.
        const { type, data } = payload;
        console.log(type, data, "type, data");
        // Handle user creation event.
        if (type === 'user.created') {
            try {
                const { id, email_addresses, first_name, last_name } = data;
                // Create a new user in our database.
                yield user_auth_1.default.create({
                    clerkId: id,
                    email: email_addresses[0].email_address,
                    firstName: first_name,
                    lastName: last_name
                });
                console.log(`User created in database: ${id}`);
            }
            catch (error) {
                console.error('Error creating user in database:', error);
                // Do not return an error to Clerk to prevent retries.
            }
        }
        // Handle user update event.
        if (type === 'user.updated') {
            try {
                const { id, email_addresses, first_name, last_name } = data;
                console.log(id, email_addresses, first_name, last_name, "update user");
                // Find and update the user in our database.
                yield user_auth_1.default.findOneAndUpdate({ clerkId: id }, {
                    email: email_addresses[0].email_address,
                    firstName: first_name,
                    lastName: last_name
                });
                console.log(`User updated in database: ${id}`);
            }
            catch (error) {
                console.error('Error updating user in database:', error);
            }
        }
        // Handle user deletion event.
        if (type === 'user.deleted') {
            try {
                const { id } = data;
                // Find and delete the user from our database.
                yield user_auth_1.default.findOneAndDelete({ clerkId: id });
                console.log(`User deleted from database: ${id}`);
            }
            catch (error) {
                console.error('Error deleting user from database:', error);
            }
        }
        // Respond with a success status.
        res.status(200).json({ success: true });
    })
};
