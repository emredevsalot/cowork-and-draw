import Footer from "@/components/Footer";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cowork and draw!",
  description: "Work together, draw together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="container mx-auto md:h-auto px-4 md:px-10 py-4 md:py-10">
            {children}
          </main>
          <div className="container mx-auto my-10">
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
