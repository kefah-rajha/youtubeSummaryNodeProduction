"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaddleSubscription = parsePaddleSubscription;
/**
 * Parses a Paddle webhook event payload and maps it to the ISubscription interface.
 * * @param eventData The raw event data from the Paddle webhook.
 * @returns An ISubscription object representing the parsed data.
 */
function parsePaddleSubscription(eventData) {
    var _a;
    // Parse the raw JSON string into a JavaScript object.
    const event = JSON.parse(eventData);
    console.log(event, "event");
    // Extract relevant data points from the event payload.
    const subscriptionData = event.data;
    const primaryItem = subscriptionData.items[0];
    const primaryPrice = primaryItem.price;
    const primaryProduct = primaryItem.product;
    // Map the Paddle data to the ISubscription interface.
    const subscription = {
        // The 'user_id' is expected to be a string that can be used to find the user.
        // NOTE: The `user` field in ISubscription is ObjectId, but here we are assigning a string. 
        // This may require casting or a separate step to convert to ObjectId later.
        user: subscriptionData.customData.user_id,
        paddleSubscriptionId: subscriptionData.id,
        status: subscriptionData.status,
        planId: primaryPrice.id,
        planName: primaryPrice.description || primaryProduct.name,
        priceId: primaryPrice.id,
        productId: primaryProduct.id,
        productName: primaryProduct.name,
        transactionId: subscriptionData.transactionId,
        currency: subscriptionData.currencyCode,
        // Convert the amount from cents (integer) to dollars (float).
        amount: parseFloat(primaryPrice.unitPrice.amount) / 100,
        billingCycle: {
            interval: subscriptionData.billingCycle.interval,
            frequency: subscriptionData.billingCycle.frequency
        },
        // Convert date strings to Date objects.
        startDate: new Date(subscriptionData.startedAt),
        nextBillingDate: subscriptionData.nextBilledAt ? new Date(subscriptionData.nextBilledAt) : undefined,
        endDate: subscriptionData.endDate ? new Date(subscriptionData.endDate) : undefined,
        canceledAt: subscriptionData.canceledAt ? new Date(subscriptionData.canceledAt) : undefined,
        pausedAt: subscriptionData.pausedAt ? new Date(subscriptionData.pausedAt) : undefined,
        trialEnd: ((_a = primaryItem.trialDates) === null || _a === void 0 ? void 0 : _a.endsAt) ? new Date(primaryItem.trialDates.endsAt) : undefined,
        customData: subscriptionData.customData || {},
        // Map each item in the subscription to the internal item structure.
        items: subscriptionData.items.map((item) => ({
            priceId: item.price.id,
            productId: item.product.id,
            quantity: item.quantity,
            amount: parseFloat(item.price.unitPrice.amount) / 100
        })),
        // Create an initial history entry for the event.
        history: [{
                eventType: event.eventType,
                eventDate: new Date(event.occurredAt),
                changes: {
                    status: subscriptionData.status,
                    transactionId: subscriptionData.transactionId
                },
                metadata: {
                    originalEventId: event.eventId
                }
            }]
    };
    return subscription;
}
