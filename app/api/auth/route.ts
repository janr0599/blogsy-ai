import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import getDbConnection from "@/lib/db"; // Adjust the import path as needed

export async function POST(req: Request) {
    const SIGNING_SECRET =
        process.env.NODE_ENV === "development"
            ? process.env.DEV_CLERK_WEBHOOK_SECRET
            : process.env.CLERK_WEBHOOK_SECRET;

    if (!SIGNING_SECRET) {
        throw new Error(
            "Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to your environment"
        );
    }

    console.log("DEV_CLERK_WEBHOOK_SECRET:", SIGNING_SECRET);

    // Create a new Svix instance with the secret
    const wh = new Webhook(SIGNING_SECRET);

    // Get the required Svix headers from the request. These are mandatory for verifying the payload.
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error: Missing Svix headers", { status: 400 });
    }

    console.log("Headers:", {
        svix_id,
        svix_timestamp,
        svix_signature,
    });

    // Read the request body and convert to a string for verification
    const payload = await req.json();
    const body = JSON.stringify(payload);

    let evt: WebhookEvent;

    try {
        // Verify the webhook payload using Svix
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error: Could not verify webhook:", err);
        return new Response("Error: Verification error", { status: 400 });
    }

    // Log the received event for debugging purposes
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
        `Received webhook with ID ${id} and event type of ${eventType}`
    );

    // Process the "user.created" event from Clerk
    if (evt.type === "user.created") {
        try {
            // Extract user information from the event payload.
            // Adjust these lines if your payload structure differs.
            const userData = evt.data;
            const email = userData.email_addresses?.[0]?.email_address;
            const firstName = userData.first_name;
            const lastName = userData.last_name;
            const fullName =
                firstName && lastName ? `${firstName} ${lastName}` : null;
            const clerkUserId = userData.id;

            if (!email) {
                console.error("Error: Email not found in user created event");
                return new Response("Error: Missing email", { status: 400 });
            }

            // Connect to your NeonDB
            const sql = await getDbConnection();

            // Check if the user already exists in the database
            const existingUser =
                await sql`SELECT * FROM users WHERE email = ${email}`;

            if (existingUser.length === 0) {
                // Insert the new user if not found
                await sql`
          INSERT INTO users (email, full_name, user_id)
          VALUES (${email}, ${fullName}, ${clerkUserId})
        `;
                console.log(
                    `User with email ${email} has been inserted into the database.`
                );
            } else {
                console.log(
                    `User with email ${email} already exists in the database.`
                );
            }
        } catch (error) {
            console.error("Error processing 'user.created' event:", error);
            return new Response("Error processing user creation", {
                status: 500,
            });
        }
    }

    return new Response("Webhook received", { status: 200 });
}
