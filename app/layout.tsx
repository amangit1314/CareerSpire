import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "./providers";
import { inter, dmSans } from "@/lib/fonts";
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata: Metadata = {
  title: "CareerSpire - AI-Powered Mock Interview Platform",
  description: "Practice coding interviews with AI feedback. Get personalized insights and improve your skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} ${inter.className} antialiased min-h-screen flex flex-col`}>
        <Providers>
          {/* <Navbar /> */}

          <NavbarWrapper />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}


