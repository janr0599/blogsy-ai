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
            className="transition-colors duration-200 text-gray-600 hover:text-purple-500"
        >
            {children}
        </Link>
    );
};

export default function Header() {
    return (
        <nav className="container flex items-center justify-between px-8 py-4 mx-auto">
            <div className="flex lg:flex-1">
                <NavLink href="/">
                    <span className="flex items-center gap-2 shrink-0">
                        <Feather />
                        <span className="font-extrabold text-lg">Blogsy</span>
                    </span>
                </NavLink>
            </div>
            <div className="flex lg:justify-center gap-2 lg:gap-12 lg:items-center">
                <NavLink href="/#pricing">Pricing</NavLink>
                <NavLink href="/#posts">Your Posts </NavLink>
            </div>
            <div className="flex lg:justify-end lg:flex-1">
                <div className="flex gap-2 items-center">
                    <NavLink href="/dashboard">Upload a Video</NavLink>
                    {/* User Profile */}
                </div>
                <NavLink href="/sign-in">Sign In</NavLink>
            </div>
        </nav>
    );
}
