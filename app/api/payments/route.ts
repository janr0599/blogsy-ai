import {
    handleCheckoutSessionCompleted,
    handleSubscriptionDeleted,
} from "@/lib/payment-helpers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey =
    process.env.NODE_ENV === "development"
        ? process.env.DEV_STRIPE_SECRET_KEY
        : process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(stripeSecretKey!);

export async function POST(req: NextRequest) {
    //webhook functionality
    const payload = await req.text();

    const sig = req.headers.get("stripe-signature");

    let event;

    const stripeWebhookSecret =
        process.env.NODE_ENV === "development"
            ? process.env.DEV_STRIPE_WEBHOOK_SECRET
            : process.env.STRIPE_WEBHOOK_SECRET;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            sig!,
            stripeWebhookSecret!
        );

        // Handle the event
        switch (event.type) {
            case "checkout.session.completed": {
                const session = await stripe.checkout.sessions.retrieve(
                    event.data.object.id,
                    {
                        expand: ["line_items"],
                    }
                );
                console.log({ session });

                //connect to the db create or update user
                await handleCheckoutSessionCompleted({ session, stripe });
                break;
            }
            case "customer.subscription.deleted": {
                // // connect to db
                const subscriptionId = event.data.object.id;
                const subscription = await stripe.subscriptions.retrieve(
                    subscriptionId
                );

                console.log({ subscription });

                await handleSubscriptionDeleted({ subscriptionId, stripe });
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        return NextResponse.json({
            status: "success",
        });
    } catch (err) {
        return NextResponse.json({ status: "Failed", err });
    }
}
