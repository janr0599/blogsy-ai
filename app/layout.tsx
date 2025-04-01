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
    icons: {
        icon: "/icon.ico",
        shortcut: "/icon.ico",
        apple: "/icon.ico",
    },
    metadataBase: new URL("https://www.blogsyai.app"),
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
                    <Toaster richColors position="top-right" />
                </body>
            </html>
        </ClerkProvider>
    );
}
