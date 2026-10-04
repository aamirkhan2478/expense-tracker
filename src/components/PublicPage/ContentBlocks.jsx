"use client";

import {
  Box,
  Stack,
  Heading,
  Text,
  List,
  ListItem,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";

export function PageHeader({ eyebrow, title, intro, maxW = "3xl" }) {
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box as="header">
      {eyebrow && (
        <Badge colorScheme="teal" variant="subtle" mb={3} px={3} py={1} rounded="full">
          {eyebrow}
        </Badge>
      )}
      <Heading
        as="h1"
        fontSize={{ base: "3xl", md: "4xl" }}
        fontWeight="bold"
        color={headingColor}
        lineHeight="1.2"
      >
        {title}
      </Heading>
      {intro && (
        <Text mt={4} fontSize={{ base: "md", md: "lg" }} lineHeight="tall" color={mutedColor} maxW={maxW}>
          {intro}
        </Text>
      )}
    </Box>
  );
}

export function Blocks({ blocks, spacing = 4 }) {
  const bodyColor = useColorModeValue("gray.700", "gray.300");
  const headingColor = useColorModeValue("gray.900", "white");
  const panelBg = useColorModeValue("teal.50", "whiteAlpha.100");

  return (
    <Stack spacing={spacing}>
      {blocks.map((block, index) => {
        if (block.type === "h3") {
          return (
            <Heading as="h3" size="sm" mt={4} color={headingColor} key={index}>
              {block.text}
            </Heading>
          );
        }
        if (block.type === "ul") {
          return (
            <List spacing={2} pl={1} color={bodyColor} fontSize={{ base: "sm", md: "md" }} key={index}>
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
            <List
              spacing={2}
              pl={1}
              color={bodyColor}
              fontSize={{ base: "sm", md: "md" }}
              ordered
              key={index}
            >
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
            <Box borderLeft="4px solid" borderColor="teal.400" bg={panelBg} px={5} py={4} borderRadius="md" key={index}>
              <Text fontSize={{ base: "sm", md: "md" }} lineHeight="tall" color={bodyColor}>
                {block.text}
              </Text>
            </Box>
          );
        }
        return (
          <Text fontSize={{ base: "sm", md: "md" }} lineHeight="tall" color={bodyColor} key={index}>
            {block.text}
          </Text>
        );
      })}
    </Stack>
  );
}

export function Section({ id, title, children, blurb }) {
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box as="section" id={id} scrollMarginTop="6rem">
      <Heading as="h2" size="md" mb={blurb ? 2 : 4} color={headingColor} lineHeight="1.3">
        {title}
      </Heading>
      {blurb && (
        <Text color={mutedColor} mb={5} maxW="3xl" lineHeight="tall">
          {blurb}
        </Text>
      )}
      {children}
    </Box>
  );
}

export function Card({ children, p = { base: 5, md: 6 } }) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" p={p}>
      {children}
    </Box>
  );
}
