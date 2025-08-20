import express from 'express';

import { Webhook } from 'svix';
import User from '../models/user.auth';
import 'dotenv/config';

console.log(process.env.CLERK_WEBHOOK_SECRET, "process.env.CLERK_WEBHOOK_SECRET");

export const auth = {
  // Controller function to get a single user by their Clerk ID.
  getUser: async (req: any, res: any) => {
    const { id } = req.params;
    console.log(id);

    try {
      // Find the user by their clerkId and populate the current subscription.
      const user = await User.find({ clerkId: id }).populate("currentSubscriptionId");

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
    } catch (error: unknown) {
      // Handle and return any server errors.
      res.status(500).json({
        message: error,
        success: false
      });
    }
  },

  // Controller function to handle webhooks from Clerk.
  userOperation: async (req: any, res: any) => {
    // Extract Svix headers from the request.
    const svixHeaders = {
      'svix-id': req.headers['svix-id'] as string,
      'svix-timestamp': req.headers['svix-timestamp'] as string,
      'svix-signature': req.headers['svix-signature'] as string
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
    const svixWebhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
    console.log(svixWebhook, "svixWebhook", req.body);

    let payload: any;

    console.log('--- Raw Payload (Buffer) ---', payload);
    console.log('--- Headers ---', {
      svixId: svixHeaders['svix-id'],
      svixSignature: svixHeaders['svix-signature'],
    });

    // Verify the webhook signature to ensure it's from Clerk.
    try {
      payload = svixWebhook.verify(req.body, svixHeaders) as any;
    } catch (err) {
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
        await User.create({
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name
        });

        console.log(`User created in database: ${id}`);
      } catch (error) {
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
        await User.findOneAndUpdate(
          { clerkId: id },
          {
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name
          }
        );

        console.log(`User updated in database: ${id}`);
      } catch (error) {
        console.error('Error updating user in database:', error);
      }
    }

    // Handle user deletion event.
    if (type === 'user.deleted') {
      try {
        const { id } = data;

        // Find and delete the user from our database.
        await User.findOneAndDelete({ clerkId: id });

        console.log(`User deleted from database: ${id}`);
      } catch (error) {
        console.error('Error deleting user from database:', error);
      }
    }

    // Respond with a success status.
    res.status(200).json({ success: true });
  }
};