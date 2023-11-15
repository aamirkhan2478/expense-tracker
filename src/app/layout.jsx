import { Inter } from "next/font/google";
import "./globals.css";
import ChakraUIProvider from "@/components/providers/ChakraUIProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "@/constants/theme";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Expense Tracker",
  description: "A simple expense tracker built with Next.js and Chakra UI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <SessionProvider>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <ChakraUIProvider>{children}</ChakraUIProvider>
          </SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
