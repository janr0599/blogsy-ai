import { ArrowRight, CheckIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { plans } from "@/lib/constants";
import { currentUser } from "@clerk/nextjs/server";
import getDbConnection from "@/lib/db";
import { userExists } from "@/lib/user-helpers";

export default async function Pricing() {
    const sql = await getDbConnection();

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0].emailAddress ?? "";

    let userPriceId = null;

    const user = await userExists(sql, email);

    if (user) {
        userPriceId = user[0].price_id;
    }

    return (
        <section className="relative overflow-hidden" id="pricing">
            <div className="py-12 lg:py-24 max-w-6xl mx-auto px-12 lg:px-0">
                <div className="flex items-center justify-center w-full pb-6">
                    <h2 className="font-bold text-xl uppercase mb-8 text-purple-600">
                        Pricing
                    </h2>
                </div>
                <h3 className="flex items-center justify-center mb-24 text-center font-bold">
                    Choose the plan that works for you
                </h3>
                <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
                    {plans.map(
                        (
                            {
                                name,
                                price,
                                description,
                                items,
                                id,
                                paymentLink,
                                priceId,
                            },
                            i
                        ) => (
                            <div className="relative w-full max-w-lg" key={i}>
                                <div
                                    className={cn(
                                        "relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 rounded-box border-[1px] border-gray-500/20 rounded-2xl",
                                        id === "pro" &&
                                            "border-violet-500 border-2"
                                    )}
                                >
                                    <div className="flex justify-between items-center gap-4">
                                        <div>
                                            <p className="text-lg lg:text-xl font-bold capitalize">
                                                {name}
                                            </p>
                                            <p className="text-base-content/80 mt-2">
                                                {description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-5xl tracking-tight font-extrabold">
                                            {price}
                                        </p>
                                        {id === "pro" && (
                                            <div className="flex flex-col justify-end mb-[4px]">
                                                <p className="text-xs text-base-content/60 uppercase font-semibold">
                                                    USD
                                                </p>
                                                <p className="text-xs text-base-content/60">
                                                    /month
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                                        {items.map((item, i) => (
                                            <li
                                                className="flex gap-1 items-center"
                                                key={i}
                                            >
                                                <CheckIcon
                                                    size={18}
                                                ></CheckIcon>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="space-y-2">
                                        <Button
                                            variant={"link"}
                                            className={cn(
                                                "border-2 rounded-full flex gap-2 bg-black text-gray-100 hover:no-underline hover:scale-105 transition-transform",
                                                id === "pro" &&
                                                    "border-amber-300 "
                                            )}
                                        >
                                            <Link
                                                href={
                                                    userPriceId === priceId
                                                        ? "/dashboard"
                                                        : paymentLink
                                                }
                                                className="flex gap-1 items-center"
                                            >
                                                {id === "starter"
                                                    ? "Try Free"
                                                    : userPriceId === priceId
                                                    ? "Current Plan"
                                                    : "Get Blogsy AI"}
                                                <ArrowRight size={18} />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}
