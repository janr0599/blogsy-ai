export const plans = [
    {
        id: "basic",
        name: "Basic",
        description: "Get started with Blogsy",
        price: "9.99",
        items: ["3 Blog Posts", "3 Transcriptions"],
        paymentLink: "https://buy.stripe.com/test_9AQdUSe1GeyGbZu7ss",
        priceId:
            process.env.NODE_ENV === "development"
                ? "price_1R8M89BpXPPZ8q082M68MGrK"
                : "",
    },
    {
        id: "pro",
        name: "Pro",
        description: "All blog posts let's go!",
        price: "19.99",
        items: ["Unlimited Blog Posts", "Unlimited Transcriptions"],
        paymentLink: "https://buy.stripe.com/test_6oEaIGg9Ocqy5B63cd",
        priceId:
            process.env.NODE_ENV === "development"
                ? "price_1R8MBJBpXPPZ8q08O2CwC5vd"
                : "",
    },
];
