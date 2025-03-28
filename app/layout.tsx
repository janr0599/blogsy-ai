import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/home/Header";

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
        <html lang="en">
            <body
                className={`${ibmPlexSans.className} antialiased`}
                suppressHydrationWarning={true}
            >
                <Header></Header>
                <main>{children}</main>
            </body>
        </html>
    );
}
