"use client";

import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { PUBLIC_ROUTES } from "@/constants/site";

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight="500" fontSize="lg" mb={2}>
      {children}
    </Text>
  );
};

const FooterLink = ({ href, children }) => {
  const hoverColor = useColorModeValue("teal.600", "teal.300");
  return (
    <Link
      as={NextLink}
      href={href}
      fontSize="sm"
      color="inherit"
      _hover={{ color: hoverColor, textDecoration: "none" }}
    >
      {children}
    </Link>
  );
};

export default function Footer() {
  const link = (route) => (
    <FooterLink key={route.path} href={route.path}>
      {route.label}
    </FooterLink>
  );

  const productRoutes = PUBLIC_ROUTES.filter((route) =>
    ["/", "/features", "/about"].includes(route.path)
  );
  const helpRoutes = PUBLIC_ROUTES.filter((route) =>
    ["/faq", "/help", "/contact"].includes(route.path)
  );
  const legalRoutes = PUBLIC_ROUTES.filter((route) =>
    ["/privacy", "/terms", "/cookies", "/disclaimer"].includes(route.path)
  );

  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
      borderTopWidth={1}
      borderStyle="solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
    >
      <Container as={Stack} maxW="7xl" py={10}>
        <SimpleGrid
          templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr 1fr" }}
          spacing={8}
        >
          <Stack spacing={4}>
            <Box>
              <Text
                fontFamily="heading"
                fontWeight="bold"
                fontSize="xl"
                color={useColorModeValue("teal.600", "white")}
              >
                SpendWise
              </Text>
            </Box>
            <Text fontSize="sm" lineHeight="tall" maxW="sm">
              A self-hosted tracker for expenses, income, and budgets. No bank
              connections, no third-party tracking — you or your instance operator
              holds the data.
            </Text>
          </Stack>
          <Stack align="flex-start" spacing={2}>
            <ListHeader>Product</ListHeader>
            {productRoutes.map(link)}
            <FooterLink href="/#how-it-works">How it works</FooterLink>
          </Stack>
          <Stack align="flex-start" spacing={2}>
            <ListHeader>Support</ListHeader>
            {helpRoutes.map(link)}
          </Stack>
          <Stack align="flex-start" spacing={2}>
            <ListHeader>Account</ListHeader>
            <FooterLink href="/auth">Sign in</FooterLink>
            <FooterLink href="/auth?tab=signup">Create account</FooterLink>
            <FooterLink href="/forgot-password">Forgot password</FooterLink>
          </Stack>
          <Stack align="flex-start" spacing={2}>
            <ListHeader>Legal</ListHeader>
            {legalRoutes.map(link)}
          </Stack>
        </SimpleGrid>
      </Container>
      <Box
        borderTopWidth={1}
        borderStyle="solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
      >
        <Container
          as={Stack}
          maxW="7xl"
          py={4}
          direction={{ base: "column", md: "row" }}
          spacing={4}
          justify={{ md: "space-between" }}
          align={{ md: "center" }}
        >
          <Text fontSize="sm">
            © {new Date().getFullYear()} SpendWise. All rights reserved.
          </Text>
          <Text fontSize="sm">
            Made for people who would rather know their own numbers.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
