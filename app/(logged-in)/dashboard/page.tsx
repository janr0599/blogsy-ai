import UpgradeYourPlan from "@/components/upload/UpgradeYourPlan";
import { Badge } from "@/components/ui/badge";
import BgGradient from "@/components/ui/BgGradient";
import getDbConnection from "@/lib/db";
import {
    getPlanType,
    hasCancelledPlan,
    updateUser,
    userExists,
} from "@/lib/user-helpers";
import { currentUser } from "@clerk/nextjs/server";
import UploadForm from "@/components/upload/UploadForm";

export default async function Dashboard() {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0].emailAddress ?? "";

    const sql = await getDbConnection();

    let userId = null;
    let priceId = null;

    const hasUserCancelled = await hasCancelledPlan(sql, email);

    const user = await userExists(sql, email);
    if (user) {
        //update the user_id in users table
        userId = clerkUser?.id;
        if (userId) {
            await updateUser(sql, userId, email);
        }

        priceId = user[0].price_id;
    }

    const { id: planTypeId = "starter", name: planTypeName } =
        getPlanType(priceId);

    // const isFreePlan = planType === "starter";
    const isBasicPlan = planTypeId === "basic";
    const isProPlan = planTypeId === "pro";

    return (
        <BgGradient>
            <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                    <Badge className="bg-gradient-to-r from-purple-700 to-pink-800 text-white px-4 py-1 text-lg font-semibold capitalize rounded-full">
                        {planTypeName} Plan
                    </Badge>

                    <h2 className="capitalize text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Start creating amazing content
                    </h2>

                    <p className="mt-2 text-lg leading-8 text-gray-600 max-w-2xl text-center">
                        Upload your video or audio file and let our AI do the
                        magic
                    </p>

                    <p className="mt-2 text-lg text-gray-600 max-w-2xl text-center leading-8">
                        You get{" "}
                        <span className="font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                            {isBasicPlan ? "3" : "Unlimited"} blog posts
                        </span>{" "}
                        as part of the{" "}
                        <span className="font-bold capitalize">
                            {planTypeName}
                        </span>{" "}
                        plan.
                    </p>

                    {hasUserCancelled ? (
                        <UpgradeYourPlan />
                    ) : (
                        <BgGradient>
                            <UploadForm />
                        </BgGradient>
                    )}
                </div>
            </section>
        </BgGradient>
    );
}
