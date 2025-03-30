import BgGradient from "@/components/ui/BgGradient";
import { SignIn } from "@clerk/nextjs";

export default function page() {
    return (
        <section className="flex justify-center items-center py-8 sm:py-16">
            <BgGradient>
                <SignIn />
            </BgGradient>
        </section>
    );
}
