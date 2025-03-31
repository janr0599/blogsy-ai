import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Feather } from "lucide-react";
import Link from "next/link";

const NavLink = ({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) => {
    return (
        <Link
            href={href}
            className="transition-colors duration-200 text-gray-600 hover:text-purple-500 text-sm sm:text-base"
        >
            {children}
        </Link>
    );
};

export default function Header() {
    return (
        <nav className="container flex items-center justify-between px-8 py-4 mx-auto lg:max-w-6xl">
            <div className="flex lg:flex-1">
                <NavLink href="/">
                    <span className="flex items-center gap-2 shrink-0">
                        <Feather className="hidden sm:block" />
                        <span className="font-extrabold text-lg">Blogsy</span>
                    </span>
                </NavLink>
            </div>
            <div className="flex lg:justify-center gap-2 lg:gap-12 lg:items-center">
                <NavLink href="/#pricing">Pricing</NavLink>
                <SignedIn>
                    <NavLink href="/posts">Your Posts </NavLink>
                </SignedIn>
            </div>
            <div className="flex lg:justify-end lg:flex-1">
                <SignedIn>
                    <div className="flex gap-2 items-center">
                        <NavLink href="/dashboard">Upload a Video</NavLink>
                        {/* User Profile */}
                        <UserButton />
                    </div>
                </SignedIn>

                <SignedOut>
                    <SignInButton>
                        <NavLink href="/sign-in">Sign In</NavLink>
                    </SignInButton>
                </SignedOut>
            </div>
        </nav>
    );
}
