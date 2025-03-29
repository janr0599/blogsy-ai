import { ArrowRight, CheckIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Pricing() {
    const plans = [
        {
            id: "basic",
            name: "Basic",
            description: "Get started with Blogsy",
            price: "9.99",
            items: ["3 Blog Posts", "3 Transcriptions"],
        },
        {
            id: "pro",
            name: "Pro",
            description: "All blog posts let's go!",
            price: "19.99",
            items: ["Unlimited Blog Posts", "Unlimited Transcriptions"],
        },
    ];
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
                    {plans.map(({ name, price, description, items, id }, i) => (
                        <div className="relative w-full max-w-lg" key={i}>
                            <div
                                className={cn(
                                    "relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 rounded-box border-[1px] border-gray-500/20 rounded-2xl",
                                    id === "pro" && "border-violet-500 border-2"
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
                                    <div className="flex flex-col justify-end mb-[4px]">
                                        <p className="text-xs text-base-content/60 uppercase font-semibold">
                                            USD
                                        </p>
                                        <p className="text-xs text-base-content/60">
                                            /month
                                        </p>
                                    </div>
                                </div>
                                <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                                    {items.map((item, i) => (
                                        <li
                                            className="flex gap-1 items-center"
                                            key={i}
                                        >
                                            <CheckIcon size={18}></CheckIcon>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="space-y-2">
                                    <Button
                                        variant={"link"}
                                        className={cn(
                                            "border-2 rounded-full flex gap-2 bg-black text-gray-100 hover:no-underline",
                                            id === "pro" && "border-amber-300 "
                                        )}
                                    >
                                        <Link
                                            href={"/"}
                                            className="flex gap-1 items-center"
                                        >
                                            Get Blogsy AI{" "}
                                            <ArrowRight size={18} />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

{
    /* <div className="flex items-center justify-center gap-4 lg:gap-24">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className="flex flex-col gap-4 border p-4 rounded-lg shadow-lg w-80"
                    >
                        <h4 className="text-2xl font-bold">{plan.name}</h4>
                        <p className="text-lg font-medium">
                            {plan.description}
                        </p>
                        <p className="text-3xl font-bold">${plan.price}</p>
                        <ul className="list-disc list-inside">
                            {plan.items.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        <button className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300">
                            Get Started
                        </button>
                    </div>
                ))}
            </div> */
}
