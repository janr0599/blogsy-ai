import getDbConnection from "@/lib/db";
import {
    getPlanType,
    hasCancelledPlan,
    updateUser,
    userExists,
} from "@/lib/user-helpers";
import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0].emailAddress ?? "";

    const sql = await getDbConnection();

    let userId = null;
    let planType = "starter";

    const hasUserCancelled = await hasCancelledPlan(sql, email);

    const user = await userExists(sql, email);
    if (user && user.length > 0) {
        // Update the user_id in users table
        userId = clerkUser?.id;
        if (userId) {
            await updateUser(sql, userId, email);
        }

        const priceId = user[0].price_id;

        planType = getPlanType(priceId);
    }

    // const isFreePlan = planType === "starter";
    const isBasicPlan = planType === "basic";
    const isProPlan = planType === "pro";

    return (
        <section>
            Dashboard status : Plan :{" "}
            {hasUserCancelled ? "Cancelled" : "Active"}{" "}
            {isBasicPlan ? "3" : isProPlan ? "Unlimited" : ""}
        </section>
    );
}
