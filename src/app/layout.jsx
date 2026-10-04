import { Inter } from "next/font/google";
import "./globals.css";
import ChakraUIProvider from "@/components/providers/ChakraUIProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import HighlightProviderWrapper from "@/components/providers/HighlightProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthInitializer from "@/components/providers/AuthInitializer";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "@/constants/theme";
import { SITE, SITE_URL } from "@/constants/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "expense tracker",
    "personal finance",
    "budget tracker",
    "expense manager",
    "income and expense tracking",
    "monthly budget",
    "spending categories",
    "self-hosted finance app",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE_URL,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "finance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ReactQueryProvider>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <ChakraUIProvider>
            <HighlightProviderWrapper>
              <AuthProvider>
                <AuthInitializer>
                  <PreferencesProvider>
                    {children}
                  </PreferencesProvider>
                </AuthInitializer>
              </AuthProvider>
            </HighlightProviderWrapper>
          </ChakraUIProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
