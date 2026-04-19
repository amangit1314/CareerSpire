'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import { dmSans } from '@/lib/fonts';
import { ThemeToggle } from './ThemeToggle';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { CareerSpireLogo } from './CareerSpireLogo';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, signOut, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // 'Features',
  const links = ['Dashboard', 'Practice', 'Pricing', 'Community', 'Resources'];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b glass transition-all duration-300 animate-in slide-in-from-top duration-500"
    >
      <div className="mx-auto w-full max-w-[88rem] px-3 sm:px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <CareerSpireLogo size="md" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {links.map((item) => {
              const href =
                item === 'Dashboard'
                  ? '/dashboard'
                  : item === 'Practice'
                    ? '/practice'
                    : item === 'Pricing'
                      ? '/pricing'
                      : item === 'Community'
                        ? '/community'
                        : item === 'Resources'
                          ? '/resources'
                          : '/';
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

              return (
                <Link
                  key={item}
                  href={href}
                  className={cn(
                    dmSans.className,
                    "text-sm font-medium transition-colors relative group",
                    isActive ? "text-primary font-bold" : "text-muted-foreground/80 hover:text-primary"
                  )}
                >
                  {item}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300",
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </Link>
              );
            })}

            <div className="h-4 w-px bg-[var(--secondary-avg)] mr-2" />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border border-primary/10 shadow-sm">
                        <AvatarImage src={user?.image || ''} alt={user?.name || user?.email || 'User'} />
                        <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                          {(user?.name || user?.email)?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/5">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="rounded-xl shadow-lg shadow-primary/20 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 hover:bg-muted/50 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="md:hidden py-6 space-y-4 border-t bg-background/95 backdrop-blur-lg rounded-b-3xl absolute left-0 right-0 top-16 px-4 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {links.map((item) => (
              <Link
                key={item}
                href={
                  item === 'Dashboard'
                    ? '/dashboard'
                    : item === 'Practice'
                      ? '/practice'
                      : item === 'Pricing'
                        ? '/pricing'
                        : item === 'Community'
                          ? '/community'
                          : item === 'Resources'
                            ? '/resources'
                            : '/'
                }
                className="block px-4 py-3 text-base font-medium hover:bg-primary/5 rounded-2xl transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              {isAuthenticated ? (
                <Button variant="outline" className="w-full rounded-2xl" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/auth/login" className="block w-full">
                    <Button variant="ghost" className="w-full rounded-2xl">Login</Button>
                  </Link>
                  <Link href="/auth/signup" className="block w-full">
                    <Button className="w-full rounded-2xl shadow-lg shadow-primary/20 dark:text-white">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}