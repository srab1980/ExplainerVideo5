import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navigation } from "@/components/Navigation";
import { ToastProvider } from "@/components/ToastProvider";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enhanced Next.js App",
  description: "A modern Next.js application with TypeScript, error handling, and state management.",
  keywords: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
  authors: [{ name: "Development Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider />
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
