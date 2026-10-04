"use client";

import {
  Box,
  Stack,
  Heading,
  Text,
  Link,
  Button,
  Badge,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import FaqAccordion from "@/components/PublicPage/FaqAccordion";
import { faqCategories } from "@/content/faq";

export default function FaqPageContent() {
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const chipBg = useColorModeValue("teal.50", "whiteAlpha.100");

  return (
    <Stack spacing={10}>
      <Box as="header">
        <Badge colorScheme="teal" variant="subtle" mb={3} px={3} py={1} rounded="full">
          Support
        </Badge>
        <Heading
          as="h1"
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="bold"
          color={headingColor}
          lineHeight="1.2"
        >
          Frequently asked questions
        </Heading>
        <Text mt={4} fontSize={{ base: "md", md: "lg" }} lineHeight="tall" color={mutedColor} maxW="3xl">
          Straight answers about how SpendWise handles your money records, what
          each feature actually does, and what the app deliberately does not do.
          Cannot find your answer? The{" "}
          <Link as={NextLink} href="/contact" color="teal.600" fontWeight="medium">
            contact page
          </Link>{" "}
          lists how to reach a person.
        </Text>
      </Box>

      <Box as="nav" aria-label="FAQ categories">
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
          {faqCategories.map((category) => (
            <Link
              key={category.id}
              as={NextLink}
              href={`#${category.id}`}
              fontSize="sm"
              fontWeight="medium"
              color="teal.700"
              bg={chipBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="lg"
              px={4}
              py={3}
              _hover={{ borderColor: "teal.400" }}
            >
              {category.title}
            </Link>
          ))}
        </SimpleGrid>
      </Box>

      <FaqAccordion />

      <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" p={{ base: 6, md: 8 }}>
        <Heading as="h2" size="md" mb={2} color={headingColor}>
          Still stuck?
        </Heading>
        <Text color={mutedColor} mb={5} maxW="2xl" lineHeight="tall">
          Try the Help page for step-by-step walkthroughs, or email us directly
          and we will reply to the address on your account.
        </Text>
        <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
          <Button as={NextLink} href="/help" colorScheme="teal" rounded="full">
            Visit Help
          </Button>
          <Button as={NextLink} href="/contact" variant="outline" colorScheme="teal" rounded="full">
            Contact support
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
