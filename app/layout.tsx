import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/home/Header";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const ibmPlexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
    title: "Blogsy AI",
    description: "Turn your words into captivating blog posts",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body
                    className={`${ibmPlexSans.className} antialiased`}
                    suppressHydrationWarning={true}
                >
                    <Header />
                    <main>{children}</main>
                    <Toaster richColors />
                </body>
            </html>
        </ClerkProvider>
    );
}
