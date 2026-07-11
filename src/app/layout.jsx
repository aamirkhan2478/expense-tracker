import { Inter } from "next/font/google";
import "./globals.css";
import ChakraUIProvider from "@/components/providers/ChakraUIProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import HighlightProviderWrapper from "@/components/providers/HighlightProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthInitializer from "@/components/providers/AuthInitializer";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "@/constants/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SpendWise - Smart Personal Finance",
  description: "Take control of your money with beautiful tracking, insights, and effortless budgeting.",
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
                  {children}
                </AuthInitializer>
              </AuthProvider>
            </HighlightProviderWrapper>
          </ChakraUIProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
