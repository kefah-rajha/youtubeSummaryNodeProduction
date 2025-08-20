import { Subscriptions } from "../models/subscriptionsModels";
import User from '../models/user.auth';

import { parsePaddleSubscription } from "../utils/paddleWebHookDataEventHandler";

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
  async function handleSubscriptionCreated(eventData: any) {
    // Parse the incoming event data into a structured ISubscription object.
    const subscriptionData = parsePaddleSubscription(eventData);
    console.log(subscriptionData.user, "subscriptionData");

    try {
      if (subscriptionData.user) {
        // Create a new subscription document in the database.
        const subscription = new Subscriptions({ ...subscriptionData });
        const subscriptionAfterSave = await subscription.save();
        
        console.log(subscriptionAfterSave.user, "subscriptionAfterSave Id");
        console.log(subscriptionAfterSave.user, "subscriptionAfterSave user");

        // Find the user and link the newly created subscription to their profile.
        // We use `clerkId` to find the user and set `currentSubscriptionId` to the new subscription's ID.
        const updateSubscriptionUser = await User.updateOne(
          { clerkId: subscriptionAfterSave.user },
          { $set: { currentSubscriptionId: subscriptionAfterSave._id } },
          { runValidators: true }
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Handles the 'subscription.updated' webhook event.
   * @param data The event data from Paddle.
   */
  async function handleSubscriptionUpdated(data: any) {
    console.log('Subscription updated:');
    // Implement your business logic here for when a subscription is updated.
  }

  /**
   * Handles the 'subscription.cancelled' webhook event.
   * @param data The event data from Paddle.
   */
  async function handleSubscriptionCancelled(data: any) {
    console.log('Subscription cancelled:');
    // Implement your business logic here for when a subscription is cancelled.
  }

  /**
   * Handles the 'payment.succeeded' webhook event.
   * @param data The event data from Paddle.
   */
  async function handlePaymentSucceeded(data: any) {
    console.log('Payment succeeded:');
    // Implement your business logic here for a successful payment.
  }

  /**
   * The main function to process incoming webhook events based on their type.
   * @param event The webhook event object from Paddle.
   */
  async function processEvent(event: any) {
    // Serialize the event object to a string for logging or further processing.
    const data = JSON.stringify(event, null, 2);

    // Use a switch statement to route events to the appropriate handler function.
    switch (event.eventType) {
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data);
        break;
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data);
        break;
      default:
        // Log a warning for any event types that are not handled.
        console.warn(`Unhandled event type: ${event.eventType}`);
    }
  }

  // Return the public interface of the processor.
  return {
    processEvent
  };
}

// Create and export a single instance of the webhook processor.
export const webhookProcessor = createWebhookProcessor();