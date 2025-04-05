import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

// Remove this import:
// import { Inter } from "next/font/google";

// Replace with local font or use font-family in CSS
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Commerce Store",
  description: "Your one-stop shop for amazing products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Remove the inter.className reference */}
      <body className="font-sans" suppressHydrationWarning>
        <Providers>
          <Toaster position="top-right" />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
