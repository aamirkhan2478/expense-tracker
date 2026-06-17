"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Stack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiPieChart,
  FiTrendingUp,
  FiShield,
  FiZap,
} from "react-icons/fi";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const features = [
  { icon: FiTrendingUp, text: "Track income & expenses effortlessly" },
  { icon: FiPieChart, text: "Visualize with beautiful charts" },
  { icon: FiShield, text: "Secure & private by default" },
  { icon: FiZap, text: "Real-time insights & analytics" },
];

export default function AuthBranding() {
  return (
    <Flex
      w={{ base: "100%", lg: "50%" }}
      minH={{ base: "300px", lg: "100vh" }}
      bgGradient="linear(to-br, teal.500, green.500)"
      position="relative"
      overflow="hidden"
      align="center"
      justify="center"
      p={{ base: 8, md: 12 }}
    >
      {/* Decorative shapes */}
      <Box
        position="absolute"
        top="-100px"
        left="-100px"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="white"
        opacity="0.08"
      />
      <Box
        position="absolute"
        bottom="-80px"
        right="-80px"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="white"
        opacity="0.06"
      />
      <Box
        position="absolute"
        top="40%"
        right="10%"
        w="120px"
        h="120px"
        borderRadius="full"
        bg="white"
        opacity="0.05"
      />

      <Stack
        position="relative"
        zIndex={1}
        spacing={8}
        maxW="md"
        color="white"
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Flex align="center" gap={3} mb={6}>
            <Box
              w={10}
              h={10}
              borderRadius="xl"
              bg="whiteAlpha.200"
              backdropFilter="blur(10px)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiPieChart} boxSize={5} color="white" />
            </Box>
            <Heading size="lg" fontWeight="bold" letterSpacing="tight">
              SpendWise
            </Heading>
          </Flex>

          <Heading
            size={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            lineHeight="shorter"
            mb={4}
          >
            Smart Personal
            <br />
            Finance Management
          </Heading>
          <Text fontSize="lg" color="whiteAlpha.900" maxW="sm">
            Take control of your money with beautiful tracking, insights, and
            effortless budgeting.
          </Text>
        </MotionBox>

        <Stack spacing={4}>
          {features.map((f, i) => (
            <MotionFlex
              key={f.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              align="center"
              gap={3}
            >
              <Flex
                w={8}
                h={8}
                borderRadius="lg"
                bg="whiteAlpha.200"
                align="center"
                justify="center"
              >
                <Icon as={f.icon} boxSize={4} />
              </Flex>
              <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.900">
                {f.text}
              </Text>
            </MotionFlex>
          ))}
        </Stack>

        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          pt={4}
        >
          <Text fontSize="sm" color="whiteAlpha.700">
            © {new Date().getFullYear()} SpendWise. All rights reserved.
          </Text>
        </MotionBox>
      </Stack>
    </Flex>
  );
}
