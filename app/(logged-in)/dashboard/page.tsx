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

    const plan = getPlanType(priceId) || { id: "starter", name: "Starter" };
    const { id: planTypeId, name: planTypeName } = plan;

    const isStarterPlan = planTypeId === "starter";
    const isProPlan = planTypeId === "pro";

    // check number of posts per plan
    const posts = await sql`SELECT * FROM posts WHERE user_id = ${userId}`;
    console.log(posts.length);

    const isValidStarterPlan = isStarterPlan && posts.length < 3;
    console.log(isStarterPlan);
    console.log(isValidStarterPlan);

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

                    {!hasUserCancelled && (isValidStarterPlan || isProPlan) ? (
                        <BgGradient>
                            <UploadForm />
                        </BgGradient>
                    ) : (
                        <UpgradeYourPlan />
                    )}
                </div>
            </div>
        </BgGradient>
    );
}
