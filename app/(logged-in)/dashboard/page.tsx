import BgGradient from "@/components/ui/BgGradient";
import { Badge } from "@/components/ui/badge";
import UpgradeYourPlan from "@/components/upload/UpgradeYourPlan";
import UploadForm from "@/components/upload/UploadForm";
import getDbConnection from "@/lib/db";
import { userExists, getPlanType, hasCancelledPlan } from "@/lib/user-helpers";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return redirect("/sign-in");
    }

    const email = clerkUser?.emailAddresses?.[0].emailAddress ?? "";

    const sql = await getDbConnection();

    let userId = null;
    let priceId = null;

    const hasUserCancelled = await hasCancelledPlan(sql, email);
    const user = await userExists(sql, email);

    if (user) {
        userId = user[0].user_id;
        priceId = user[0].price_id;
    }

    // If the user has cancelled, treat them as if they are on the "starter" plan
    const plan = hasUserCancelled
        ? { id: "starter", name: "Starter" }
        : getPlanType(priceId) || { id: "starter", name: "Starter" };

    const { id: planTypeId, name: planTypeName } = plan;

    const isStarterPlan = planTypeId === "starter";
    const isProPlan = planTypeId === "pro";

    // Check the number of posts for the user
    const posts = await sql`SELECT * FROM posts WHERE user_id = ${userId}`;
    console.log(posts.length);

    const urlPosts = await sql`
    SELECT * FROM posts
    WHERE user_id = ${userId} 
    AND source = 'url'
    AND DATE_PART('year', created_at) = DATE_PART('year', CURRENT_DATE)
    AND DATE_PART('month', created_at) = DATE_PART('month', CURRENT_DATE)
`;
    console.log("URL posts this month:", urlPosts.length);

    const limit = isProPlan ? 5 : 0; // Set limit based on plan types
    const isUnderLimit = urlPosts.length < limit; //
    console.log(isUnderLimit);

    const isValidStarterPlan = isStarterPlan && posts.length < 3;
    const canUpload = isValidStarterPlan || isProPlan;

    const showUpgradePlan = posts.length >= 3;

    return (
        <BgGradient>
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                    <Badge className="bg-gradient-to-r from-purple-700 to-pink-800 text-white px-4 py-1 text-lg font-semibold capitalize">
                        {planTypeName} Plan
                    </Badge>

                    <h2 className="capitalize text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Start creating amazing content
                    </h2>

                    <p className="mt-2 text-lg leading-8 text-gray-600 max-w-2xl text-center">
                        Upload your audio or video file and let our AI do the
                        magic!
                    </p>

                    {(isStarterPlan || isProPlan) && (
                        <p className="mt-2 text-lg leading-8 text-gray-600 max-w-2xl text-center">
                            You get{" "}
                            <span className="font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
                                {isStarterPlan ? "3" : "Unlimited"} blog posts
                            </span>{" "}
                            as part of the{" "}
                            <span className="font-bold capitalize">
                                {planTypeName}
                            </span>{" "}
                            Plan.
                        </p>
                    )}

                    {canUpload ? (
                        <BgGradient>
                            <UploadForm
                                userId={userId}
                                isProPlan={isProPlan}
                                isUnderLimit={isUnderLimit}
                            />
                        </BgGradient>
                    ) : showUpgradePlan ? (
                        <UpgradeYourPlan />
                    ) : (
                        <p className="text-lg text-gray-600">
                            You have reached your plan's limit. Upgrade to Pro
                            to upload more posts.
                        </p>
                    )}
                </div>
            </div>
        </BgGradient>
    );
}
