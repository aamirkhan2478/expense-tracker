"use client";

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Stack,
  Flex,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiUserPlus, FiList, FiTrendingUp } from "react-icons/fi";

const MotionBox = motion(Box);

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up in seconds with your email. No credit card required, no complicated setup.",
    icon: FiUserPlus,
  },
  {
    number: "02",
    title: "Add Transactions",
    description:
      "Log your income and expenses. Categorize them to see exactly where your money goes.",
    icon: FiList,
  },
  {
    number: "03",
    title: "Gain Insights",
    description:
      "Watch beautiful charts update in real-time. Make smarter financial decisions every day.",
    icon: FiTrendingUp,
  },
];

export default function HowItWorks() {
  const stepTextColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box
      id="how-it-works"
      py={{ base: 16, md: 24 }}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Container maxW="7xl">
        <Stack spacing={4} as={Container} maxW="3xl" textAlign="center" mb={16}>
          <Heading
            fontSize={{ base: "3xl", sm: "4xl" }}
            fontWeight="bold"
            color={useColorModeValue("gray.900", "white")}
          >
            Get Started in{" "}
            <Text as="span" color="teal.500">
              3 Easy Steps
            </Text>
          </Heading>
          <Text
            color={useColorModeValue("gray.600", "gray.300")}
            fontSize={{ base: "lg", md: "xl" }}
          >
            No complicated onboarding. Start tracking your finances in under a
            minute.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} position="relative">
          {steps.map((step, index) => (
            <MotionBox
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Stack align="center" textAlign="center" spacing={6}>
                <Flex
                  w={20}
                  h={20}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="teal.500"
                  color="white"
                  fontSize="2xl"
                  fontWeight="bold"
                  boxShadow="0 0 0 8px rgba(20, 184, 166, 0.15)"
                  position="relative"
                >
                  {step.number}
                </Flex>
                <Heading size="md">{step.title}</Heading>
                <Text
                  color={stepTextColor}
                  maxW="sm"
                  lineHeight="tall"
                >
                  {step.description}
                </Text>
              </Stack>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
