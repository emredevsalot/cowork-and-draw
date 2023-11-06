import Footer from "@/components/Footer";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LocalProvider } from "./providers/LocalProvider";

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
        <main className="mx-auto md:my-auto w-screen md:w-2/3 md:h-auto p-4 md:p-8 pb-32">
          <div className="relative bg-white w-full h-full md:h-auto p-8 md:rounded-xl md:shadow-xl">
            <LocalProvider>{children}</LocalProvider>
          </div>
        </main>
        <div className="container mx-auto my-10">
          <Footer />
        </div>
      </body>
    </html>
  );
}
