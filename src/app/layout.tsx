import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastContext";
import site from "@/data/site.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Learning Platform - Master Programming & Tech",
  description:
    "Learn JavaScript, TypeScript, React, Linux, DevOps, Database, Machine Learning and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning // TODO: Remove this when we have a better solution (Grammarly browser extension)
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `,
          }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950"
        suppressHydrationWarning // TODO: Remove this when we have a better solution (Grammarly browser extension)
      >
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </ToastProvider>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-sm text-zinc-400">
          &copy; {new Date().getFullYear()} {site.footer.text}
          <a
            href={site.footer.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-500 dark:text-zinc-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors underline underline-offset-2"
          >
            {site.footer.linkText}
          </a>
        </footer>
      </body>
    </html>
  );
}
