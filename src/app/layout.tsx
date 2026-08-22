import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prmovie.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "PR Movie — Developer Review Accelerator & Architecture Flow Copilot",
    template: "%s | PR Movie",
  },
  description:
    "Stop mentally compiling 40-file code diffs. PR Movie accelerates developer code reviews by mapping data flow architecture, isolating logic blast radius, and providing 100% verified GitHub line citations in 30 seconds.",
  keywords: [
    "pull request",
    "github pull request",
    "code review copilot",
    "developer tools",
    "git diff visualizer",
    "architecture diagrams",
    "code review accelerator",
    "AST diff analysis",
    "PR Movie",
    "software engineering",
    "pull request explanation",
    "developer cognitive load",
  ],
  authors: [{ name: "PR Movie Engineering Team", url: appUrl }],
  creator: "PR Movie",
  publisher: "PR Movie",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PR Movie — Developer Review Accelerator & Architecture Flow Copilot",
    description:
      "Turn complex GitHub Pull Requests into animated 6-scene storyboards with architecture flow diagrams, root diff excerpts, and 100% verified source citations.",
    url: "/",
    siteName: "PR Movie",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PR Movie — Developer Review Accelerator & Architecture Flow Copilot",
    description:
      "Turn complex GitHub Pull Requests into animated 6-scene storyboards with architecture flow diagrams, root diff excerpts, and 100% verified source citations.",
    creator: "@prmovie",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
        <ClerkProvider appearance={clerkAppearance}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster
              position="bottom-right"
              richColors
              theme="dark"
              toastOptions={{
                className: "border border-white/10 bg-[#0d111a]/95 text-slate-100 backdrop-blur-xl shadow-2xl rounded-xl text-xs",
              }}
            />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}