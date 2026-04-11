import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Super-Agent Sales OS - AI-Powered Sales Automation",
  description: "Revolutionary AI-powered sales automation platform with intelligent agents that handle 90% of your sales research and admin work.",
  keywords: ["AI Sales", "Sales Automation", "Agent OS", "CRM", "Lead Generation", "Sales Intelligence"],
  authors: [{ name: "Super-Agent Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Super-Agent Sales OS",
    description: "AI-powered sales automation with intelligent agents",
    url: "https://super-agent.com",
    siteName: "Super-Agent OS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Super-Agent Sales OS",
    description: "AI-powered sales automation with intelligent agents",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            {children}
            <ThemeToggle />
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
