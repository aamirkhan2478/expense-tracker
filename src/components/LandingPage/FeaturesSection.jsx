"use client";

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Icon,
  Text,
  Stack,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiPieChart,
  FiTag,
  FiBarChart2,
  FiShield,
  FiSmartphone,
} from "react-icons/fi";

const MotionBox = motion(Box);

const features = [
  {
    title: "Expense Tracking",
    text: "Log and categorize every expense in seconds. Keep a clear record of where your money goes.",
    icon: FiTrendingUp,
    color: "red",
  },
  {
    title: "Income Management",
    text: "Track multiple income sources and visualize your earnings over time with detailed reports.",
    icon: FiPieChart,
    color: "green",
  },
  {
    title: "Smart Categories",
    text: "Organize transactions with custom categories. Understand spending habits at a glance.",
    icon: FiTag,
    color: "blue",
  },
  {
    title: "Visual Analytics",
    text: "Beautiful charts and graphs that make understanding your finances simple and intuitive.",
    icon: FiBarChart2,
    color: "purple",
  },
  {
    title: "Secure & Private",
    text: "Your financial data is protected with industry-standard security and authentication.",
    icon: FiShield,
    color: "orange",
  },
  {
    title: "Responsive Design",
    text: "Access your dashboard from any device. Desktop, tablet, or mobile — it just works.",
    icon: FiSmartphone,
    color: "teal",
  },
];

export default function FeaturesSection() {
  return (
    <Box id="features" py={{ base: 16, md: 24 }} bg={useColorModeValue("white", "gray.900")}>
      <Container maxW="7xl">
        <Stack spacing={4} as={Container} maxW="3xl" textAlign="center" mb={16}>
          <Heading
            fontSize={{ base: "3xl", sm: "4xl" }}
            fontWeight="bold"
            color={useColorModeValue("gray.900", "white")}
          >
            Everything You Need to{" "}
            <Text as="span" color="teal.500">
              Manage Money
            </Text>
          </Heading>
          <Text
            color={useColorModeValue("gray.600", "gray.300")}
            fontSize={{ base: "lg", md: "xl" }}
          >
            Powerful features designed to help you track, analyze, and improve
            your financial health — all in one place.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {features.map((feature, index) => (
            <MotionBox
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

function FeatureCard({ title, text, icon, color }) {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <Stack
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      p={8}
      h="full"
      transition="all 0.3s ease"
      _hover={{
        transform: "translateY(-8px)",
        boxShadow: "xl",
        borderColor: `${color}.300`,
      }}
    >
      <Flex
        w={14}
        h={14}
        align="center"
        justify="center"
        rounded="xl"
        bg={`${color}.100`}
        mb={4}
      >
        <Icon as={icon} w={7} h={7} color={`${color}.500`} />
      </Flex>
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color={useColorModeValue("gray.600", "gray.300")} lineHeight="tall">
        {text}
      </Text>
    </Stack>
  );
}
