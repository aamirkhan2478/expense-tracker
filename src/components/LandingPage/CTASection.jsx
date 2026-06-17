"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stack,
  useColorModeValue,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

const MotionBox = motion(Box);

export default function CTASection() {
  return (
    <Box py={{ base: 16, md: 24 }} bg={useColorModeValue("white", "gray.900")}>
      <Container maxW="5xl">
        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          bgGradient="linear(to-br, teal.500, green.500)"
          borderRadius="3xl"
          p={{ base: 8, md: 16 }}
          position="relative"
          overflow="hidden"
        >
          {/* Decorative circles */}
          <Box
            position="absolute"
            top="-50px"
            right="-50px"
            w="200px"
            h="200px"
            bg="white"
            opacity="0.1"
            borderRadius="full"
          />
          <Box
            position="absolute"
            bottom="-30px"
            left="-30px"
            w="150px"
            h="150px"
            bg="white"
            opacity="0.1"
            borderRadius="full"
          />

          <Stack
            position="relative"
            zIndex={1}
            spacing={8}
            align="center"
            textAlign="center"
          >
            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              color="white"
              fontWeight="bold"
            >
              Ready to Take Control of Your Finances?
            </Heading>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              color="whiteAlpha.900"
              maxW="2xl"
            >
              Join thousands of users who are already saving more and spending
              smarter with SpendWise. It is free to get started.
            </Text>

            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={4}
              w={{ base: "full", sm: "auto" }}
            >
              <Button
                as={NextLink}
                href="/auth?tab=signup"
                size="lg"
                rounded="full"
                px={10}
                bg="white"
                color="teal.600"
                fontWeight="bold"
                rightIcon={<FiArrowRight />}
                _hover={{ bg: "gray.100", transform: "translateY(-2px)" }}
                transition="all 0.2s"
                boxShadow="lg"
              >
                Start Tracking Free
              </Button>
            </Flex>

            <Flex
              wrap="wrap"
              justify="center"
              gap={{ base: 3, md: 6 }}
              color="whiteAlpha.900"
              fontSize="sm"
            >
              {["No credit card required", "Free forever plan", "Cancel anytime"].map(
                (item) => (
                  <Flex key={item} align="center" gap={2}>
                    <Icon as={FiCheckCircle} />
                    <Text>{item}</Text>
                  </Flex>
                )
              )}
            </Flex>
          </Stack>
        </MotionBox>
      </Container>
    </Box>
  );
}
