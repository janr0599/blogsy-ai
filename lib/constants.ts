export const plans = [
    {
        id: "starter",
        name: "Starter",
        description: "Get started with Blogsy",
        price: "Free",
        items: ["3 blog posts", "3 Transcriptions"],
        paymentLink: "/dashboard",
        priceId: "",
    },
    {
        id: "pro",
        name: "Pro",
        description: "All blog posts let's go!",
        price: "9.99",
        items: ["Unlimited blog posts", "Unlimited Transcriptions"],
        paymentLink: "https://buy.stripe.com/eVa8AA7w6amsbHG288",
        priceId:
            process.env.NODE_ENV === "development"
                ? "price_1R8M89BpXPPZ8q082M68MGrK"
                : "price_1R8vVSBpXPPZ8q08Q5iX5bDZ",
    },
    // {
    //     id: "pro",
    //     name: "Pro",
    //     description: "All blog posts let's go!",
    //     price: "19.99",
    //     items: ["Unlimited Blog Posts", "Unlimited Transcriptions"],
    //     paymentLink: "https://buy.stripe.com/9AQdUUbMm528cLK7st",
    //     priceId:
    //         process.env.NODE_ENV === "development"
    //             ? "price_1R8MBJBpXPPZ8q08O2CwC5vd"
    //             : "price_1R8vfOBpXPPZ8q0860cu55sF",
    // },
];
