import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./components/providers/convex-provider";
import { ThemeProvider } from "./components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "./components/pwa/sw-registration";
import "./globals.css";
import AuthModalProvider from "./components/providers/AuthModalProvider";
import AuthModal from "./(root)/_components/AuthModal";

/* ─── Metadata ─────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://Svation.app",
  ),
  title: {
    default: "Svation — WhatsApp & Instagram Automation for India",
    template: "%s — Svation",
  },
  description:
    "Automate your WhatsApp and Instagram DMs with AI. Built for Indian creators, coaches, and business owners. Setup in under 2 minutes.",
  keywords: [
    "WhatsApp automation India",
    "Instagram DM automation",
    "WhatsApp Business API",
    "Hinglish AI chatbot",
    "DM automation for creators",
    "Instagram comment automation",
    "WhatsApp drip sequence",
  ],
  authors: [{ name: "Svation" }],
  creator: "Svation",

  /* PWA */
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Svation",
    startupImage: [
      {
        url: "/icons/splash-2048x2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/splash-1668x2388.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/splash-1290x2796.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/splash-1170x2532.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },

  /* Open Graph */
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://Svation.app",
    siteName: "Svation",
    title: "Svation — WhatsApp & Instagram Automation for India",
    description:
      "Automate your DMs with AI. Built for Indian creators and business owners.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Svation — WhatsApp & Instagram Automation",
      },
    ],
  },

  /* Twitter */
  twitter: {
    card: "summary_large_image",
    title: "Svation — WhatsApp & Instagram Automation for India",
    description: "Automate your DMs with AI. Built for Indian creators.",
    images: ["/og-image.png"],
  },

  /* Icons */
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/safari-pinned-tab.svg",
        color: "#e85d04",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

/* ─── Viewport ─────────────────────────────────────────── */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false /* Prevents accidental zoom on mobile inputs */,
  viewportFit: "cover" /* Full-screen on iPhone notch / Dynamic Island */,
};

/* ─── Root Layout ──────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#e85d04",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#0f0f0f",
          borderRadius: "6px",
          fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif",
        },
        elements: {
          /* Remove Clerk's default card shadow — we use our own */
          card: "shadow-none border border-border rounded-lg",
          formButtonPrimary:
            "bg-accent hover:bg-accent-hover text-white text-sm font-medium",
        },
      }}
    >
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning /* next-themes flips .dark class — suppress mismatch */
      >
        <head>
          {/* MS tile for Windows */}
          <meta name="msapplication-TileColor" content="#e85d04" />
          <meta
            name="msapplication-TileImage"
            content="/icons/icon-144x144.png"
          />
          {/* Prevent iOS Safari from auto-detecting phone numbers as links */}
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <AuthModalProvider>
                {children}
                <AuthModal /> {/* 🔥 GLOBAL MODAL */}
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                    },
                  }}
                />
              </AuthModalProvider>
            </ConvexClientProvider>
          </ThemeProvider>

          {/* Register service worker — client component */}
          <ServiceWorkerRegistration />
        </body>
      </html>
    </ClerkProvider>
  );
}
