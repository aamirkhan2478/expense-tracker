"use client";

import { Box, Flex, Container } from "@chakra-ui/react";
import Navbar from "@/components/LandingPage/Navbar";
import Footer from "@/components/LandingPage/Footer";

export default function PublicPageShell({ children, maxW = "4xl" }) {
  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Box
        as="main"
        id="main-content"
        flex="1"
        w="full"
        pt={{ base: 24, md: 28 }}
        pb={{ base: 16, md: 24 }}
      >
        <Container maxW={maxW}>{children}</Container>
      </Box>
      <Footer />
    </Flex>
  );
}
