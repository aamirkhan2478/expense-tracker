"use client";

import {
  Box,
  Stack,
  Heading,
  Text,
  List,
  ListItem,
  Link,
  Badge,
  Divider,
  SimpleGrid,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";

const RELATED = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

function Block({ block }) {
  const bodyColor = useColorModeValue("gray.700", "gray.300");
  const headingColor = useColorModeValue("gray.900", "white");
  const noteBg = useColorModeValue("teal.50", "whiteAlpha.100");

  if (block.type === "h3") {
    return (
      <Heading as="h3" size="sm" mt={6} mb={2} color={headingColor}>
        {block.text}
      </Heading>
    );
  }

  if (block.type === "ul") {
    return (
      <List spacing={2} pl={1} color={bodyColor} fontSize={{ base: "sm", md: "md" }}>
        {block.items.map((item) => (
          <ListItem key={item} lineHeight="tall">
            {item}
          </ListItem>
        ))}
      </List>
    );
  }

  if (block.type === "ol") {
    return (
      <List spacing={2} pl={1} color={bodyColor} fontSize={{ base: "sm", md: "md" }} ordered>
        {block.items.map((item) => (
          <ListItem key={item} lineHeight="tall">
            {item}
          </ListItem>
        ))}
      </List>
    );
  }

  if (block.type === "note") {
    return (
      <Box
        borderLeft="4px solid"
        borderColor="teal.400"
        bg={noteBg}
        px={5}
        py={4}
        borderRadius="md"
      >
        <Text fontSize={{ base: "sm", md: "md" }} lineHeight="tall" color={bodyColor}>
          {block.text}
        </Text>
      </Box>
    );
  }

  return (
    <Text fontSize={{ base: "sm", md: "md" }} lineHeight="tall" color={bodyColor}>
      {block.text}
    </Text>
  );
}

export default function LegalDocument({ doc, showToc = true }) {
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Stack spacing={10}>
      <Box as="header">
        <Badge colorScheme="teal" variant="subtle" mb={3} px={3} py={1} rounded="full">
          Legal
        </Badge>
        <Heading
          as="h1"
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="bold"
          color={headingColor}
          lineHeight="1.2"
        >
          {doc.title}
        </Heading>
        <Text mt={3} fontSize="sm" color={mutedColor}>
          Last updated: {doc.lastUpdated}
        </Text>
        <Text mt={5} fontSize={{ base: "md", md: "lg" }} lineHeight="tall" color={mutedColor}>
          {doc.intro}
        </Text>
      </Box>

      {showToc && doc.sections.length > 4 && (
        <Box
          as="nav"
          aria-label={`${doc.title} contents`}
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          p={{ base: 5, md: 6 }}
        >
          <Heading as="h2" size="sm" mb={3} color={headingColor}>
            On this page
          </Heading>
          <List spacing={2} columns={{ base: 1, md: 2 }} columnGap={6} fontSize="sm">
            {doc.sections.map((section) => (
              <ListItem key={section.id}>
                <Link as={NextLink} href={`#${section.id}`} color="teal.600" _hover={{ color: "teal.500" }}>
                  {section.heading}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Stack spacing={10}>
        {doc.sections.map((section) => (
          <Box as="section" key={section.id} id={section.id} scrollMarginTop="6rem">
            <Heading as="h2" size="md" mb={4} color={headingColor} lineHeight="1.3">
              {section.heading}
            </Heading>
            <Stack spacing={4}>
              {section.blocks.map((block, index) => (
                <Block key={`${section.id}-${index}`} block={block} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>

      <Divider borderColor={borderColor} />

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" p={6}>
          <Heading as="h2" size="sm" mb={2} color={headingColor}>
            Questions about this document?
          </Heading>
          <Text fontSize="sm" color={mutedColor} mb={4} lineHeight="tall">
            Send us a message and we will point you to the right person or explain
            what an instance operator can help with.
          </Text>
          <Button as={NextLink} href="/contact" size="sm" colorScheme="teal" rounded="full">
            Contact support
          </Button>
        </Box>
        <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" p={6}>
          <Heading as="h2" size="sm" mb={3} color={headingColor}>
            Related documents
          </Heading>
          <Stack spacing={2} fontSize="sm">
            {RELATED.filter((item) => item.href !== `/${doc.slug}`).map((item) => (
              <Link key={item.href} as={NextLink} href={item.href} color="teal.600" _hover={{ color: "teal.500" }}>
                {item.label}
              </Link>
            ))}
          </Stack>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
