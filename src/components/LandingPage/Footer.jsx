"use client";

import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VisuallyHidden,
  chakra,
  useColorModeValue,
  Flex,
  Icon,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FiGithub, FiTwitter, FiGlobe } from "react-icons/fi";

const SocialButton = ({ children, label, href }) => {
  return (
    <chakra.button
      bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
      rounded="full"
      w={8}
      h={8}
      cursor="pointer"
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      transition="background 0.3s ease"
      _hover={{
        bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight="500" fontSize="lg" mb={2}>
      {children}
    </Text>
  );
};

export default function Footer() {
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
          templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr" }}
          spacing={8}
        >
          <Stack spacing={6}>
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
            <Text fontSize="sm">
              Your personal expense tracker. Simple, beautiful, and free. Take
              control of your money today.
            </Text>
            <Stack direction="row" spacing={6}>
              <SocialButton label="Twitter" href="#">
                <Icon as={FiTwitter} />
              </SocialButton>
              <SocialButton label="GitHub" href="#">
                <Icon as={FiGithub} />
              </SocialButton>
              <SocialButton label="Website" href="#">
                <Icon as={FiGlobe} />
              </SocialButton>
            </Stack>
          </Stack>
          <Stack align="flex-start">
            <ListHeader>Product</ListHeader>
            <Link as={NextLink} href="#features">Features</Link>
            <Link as={NextLink} href="#how-it-works">How it Works</Link>
            <Link as={NextLink} href="/dashboard">Dashboard</Link>
          </Stack>
          <Stack align="flex-start">
            <ListHeader>Account</ListHeader>
            <Link as={NextLink} href="/auth">Sign In</Link>
            <Link as={NextLink} href="/auth?tab=signup">Sign Up</Link>
          </Stack>
          <Stack align="flex-start">
            <ListHeader>Legal</ListHeader>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
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
        </Container>
      </Box>
    </Box>
  );
}
