"use client";

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Heading,
  Text,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { faqCategories } from "@/content/faq";

export default function FaqAccordion() {
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const panelBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  return (
    <Stack spacing={12}>
      {faqCategories.map((category) => (
        <Box as="section" key={category.id} id={category.id} scrollMarginTop="6rem">
          <Heading as="h2" size="md" mb={4} color={headingColor}>
            {category.title}
          </Heading>
          <Accordion allowMultiple borderColor={borderColor}>
            {category.items.map((item) => (
              <AccordionItem key={item.question} borderColor={borderColor}>
                <h2>
                  <AccordionButton
                    py={5}
                    px={1}
                    _hover={{ bg: hoverBg }}
                    fontWeight="semibold"
                    color={headingColor}
                  >
                    <Box as="span" flex="1" textAlign="left" fontSize={{ base: "sm", md: "md" }}>
                      {item.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel px={1} pt={0} pb={5} bg={panelBg}>
                  <Text fontSize={{ base: "sm", md: "md" }} lineHeight="tall" color={mutedColor}>
                    {item.answer}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      ))}
    </Stack>
  );
}
