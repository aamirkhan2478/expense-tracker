import { Inter } from "next/font/google";
import "./globals.css";
import ChakraUIProvider from "@/components/providers/ChakraUIProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import HighlightProviderWrapper from "@/components/providers/HighlightProvider";
import CrossTabAuthSync from "@/components/providers/CrossTabAuthSync";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "@/constants/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Expense Tracker",
  description: "A simple expense tracker built with Next.js and Chakra UI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ReactQueryProvider>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <ChakraUIProvider>
            <HighlightProviderWrapper>
              <CrossTabAuthSync />
              {children}
            </HighlightProviderWrapper>
          </ChakraUIProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
