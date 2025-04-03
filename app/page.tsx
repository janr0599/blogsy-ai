import BgGradient from "@/components/ui/BgGradient";
import Divider from "@/components/home/Divider";
import Banner from "@/components/home/Banner";
import HowItWorks from "@/components/home/HowItWorks";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/home/Footer";
import { currentUser } from "@clerk/nextjs/server";
import getDbConnection from "@/lib/db";
import { getPlanType, userExists } from "@/lib/user-helpers";

export default async function Home() {
    const clerkUser = await currentUser();

    let priceId = null;
    let userStatus = null;
    if (clerkUser) {
        const email = clerkUser?.emailAddresses?.[0].emailAddress ?? "";

        const sql = await getDbConnection();

        const user = await userExists(sql, email);

        // Safely handle the case where the user does not exist or has no price_id
        priceId = user?.[0]?.price_id;
        userStatus = user?.[0]?.status;
    }

    const plan = getPlanType(priceId) || { id: "starter" };
    const planTypeId = userStatus === "cancelled" ? "starter" : plan.id;
    return (
        <main className="mx-auto w-full inset-0 h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <BgGradient />
            <Banner />
            <Divider />
            <HowItWorks />
            <Divider />
            <Pricing planTypeId={planTypeId} />
            <Divider />
            <Footer />
        </main>
    );
}
