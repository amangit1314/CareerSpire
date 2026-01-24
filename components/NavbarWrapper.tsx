"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

const NavbarWrapper = () => {
    const pathname = usePathname();
    const isMockPage = pathname?.startsWith("/mock");

    if (isMockPage) return null;
    return <Navbar />;
};

export default NavbarWrapper;