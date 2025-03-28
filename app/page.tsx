import BgGradient from "@/components/ui/BgGradient";
import Divider from "@/components/home/Divider";
import Banner from "@/components/home/Banner";
import HowItWorks from "@/components/home/HowItWorks";
import Pricing from "@/components/home/Pricing";

export default function Home() {
    return (
        <main className="mx-auto w-full inset-0 h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <BgGradient />
            <Banner />
            <Divider />
            <HowItWorks />
            <Divider />
            <Pricing />
            {/* <Divider /> */}
            {/* <Footer /> */}
        </main>
    );
}
