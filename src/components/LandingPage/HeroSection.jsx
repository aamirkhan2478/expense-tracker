"use client";

import {
  Container,
  Stack,
  Flex,
  Box,
  Heading,
  Text,
  Button,
  Icon,
  IconButton,
  createIcon,
  useColorModeValue,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import {
  FiTrendingUp,
  FiPieChart,
  FiDollarSign,
  FiArrowRight,
} from "react-icons/fi";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

export default function HeroSection() {
  return (
    <Box
      position="relative"
      overflow="hidden"
      bgGradient={useColorModeValue(
        "linear(to-br, teal.50, white, green.50)",
        "linear(to-br, gray.900, gray.800, teal.900)"
      )}
    >
      {/* Decorative background blobs */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="600px"
        h="600px"
        bg="teal.200"
        opacity="0.2"
        borderRadius="full"
        filter="blur(80px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        w="500px"
        h="500px"
        bg="green.200"
        opacity="0.15"
        borderRadius="full"
        filter="blur(80px)"
        zIndex={0}
      />

      <Container maxW="7xl" position="relative" zIndex={1} pt={{ base: 28, md: 32 }} pb={{ base: 16, md: 24 }}>
        <Stack
          align="center"
          spacing={{ base: 10, md: 16 }}
          direction={{ base: "column", lg: "row" }}
        >
          <Stack flex={1} spacing={{ base: 6, md: 8 }}>
            <MotionFlex
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                colorScheme="teal"
                variant="subtle"
                px={3}
                py={1}
                rounded="full"
                fontSize="sm"
                fontWeight="medium"
              >
                Free & Easy to Use
              </Badge>
            </MotionFlex>

            <MotionHeading
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              lineHeight={1.1}
              fontWeight={700}
              fontSize={{ base: "4xl", sm: "5xl", lg: "6xl" }}
            >
              <Text as="span" position="relative">
                Take Control of Your
              </Text>
              <br />
              <Text as="span" color="teal.500">
                Financial Future
              </Text>
            </MotionHeading>

            <MotionText
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              color={useColorModeValue("gray.600", "gray.300")}
              fontSize={{ base: "lg", md: "xl" }}
              maxW="2xl"
            >
              Track expenses, monitor income, and visualize your spending
              habits with beautiful charts. SpendWise makes personal finance
              management simple and stress-free.
            </MotionText>

            <MotionFlex
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: "column", sm: "row" }}
            >
              <Button
                as={NextLink}
                href="/auth?tab=signup"
                rounded="full"
                size="lg"
                fontWeight="bold"
                px={8}
                colorScheme="teal"
                bg="teal.500"
                color="white"
                rightIcon={<FiArrowRight />}
                _hover={{ bg: "teal.400", transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                Get Started Free
              </Button>
              <Button
                as={NextLink}
                href="/auth"
                rounded="full"
                size="lg"
                fontWeight="bold"
                px={8}
                variant="outline"
                colorScheme="teal"
                _hover={{ bg: "teal.50" }}
              >
                Sign In
              </Button>
            </MotionFlex>

            <MotionFlex
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              align="center"
              gap={8}
              pt={4}
            >
              <Stack spacing={0}>
                <Text fontWeight="bold" fontSize="2xl" color="teal.500">
                  10k+
                </Text>
                <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                  Active Users
                </Text>
              </Stack>
              <Stack spacing={0}>
                <Text fontWeight="bold" fontSize="2xl" color="teal.500">
                  $2M+
                </Text>
                <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                  Tracked Monthly
                </Text>
              </Stack>
              <Stack spacing={0}>
                <Text fontWeight="bold" fontSize="2xl" color="teal.500">
                  4.9/5
                </Text>
                <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                  User Rating
                </Text>
              </Stack>
            </MotionFlex>
          </Stack>

          <MotionFlex
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            flex={1}
            justify="center"
            align="center"
            position="relative"
            w="full"
          >
            <MockDashboard />
          </MotionFlex>
        </Stack>
      </Container>
    </Box>
  );
}

function MockDashboard() {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.100", "gray.600");
  const txBg = useColorModeValue("gray.50", "gray.600");

  return (
    <Box position="relative" w="full" maxW="550px">
      {/* Main Dashboard Card */}
      <Box
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="2xl"
        border="1px solid"
        borderColor={borderColor}
        p={6}
        position="relative"
        zIndex={2}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="sm" color="gray.500">
              Total Balance
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="teal.500">
              $12,450.00
            </Text>
          </Box>
          <Box
            bg="teal.50"
            color="teal.600"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            fontWeight="medium"
          >
            +12.5%
          </Box>
        </Flex>

        <SimpleGrid columns={2} spacing={4} mb={6}>
          <Box bg="green.50" p={4} borderRadius="xl">
            <Flex align="center" gap={2} mb={1}>
              <Icon as={FiTrendingUp} color="green.500" />
              <Text fontSize="sm" color="gray.600">
                Income
              </Text>
            </Flex>
            <Text fontWeight="bold" fontSize="lg" color="green.600">
              $8,320
            </Text>
          </Box>
          <Box bg="red.50" p={4} borderRadius="xl">
            <Flex align="center" gap={2} mb={1}>
              <Icon as={FiTrendingUp} color="red.500" transform="rotate(180deg)" />
              <Text fontSize="sm" color="gray.600">
                Expense
              </Text>
            </Flex>
            <Text fontWeight="bold" fontSize="lg" color="red.600">
              $3,870
            </Text>
          </Box>
        </SimpleGrid>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={3}>
            Recent Transactions
          </Text>
          <Stack spacing={3}>
            {[
              { name: "Grocery Store", amount: -124.5, date: "Today" },
              { name: "Freelance Payment", amount: 850.0, date: "Yesterday" },
              { name: "Netflix Subscription", amount: -15.99, date: "Jun 15" },
            ].map((tx, i) => (
              <Flex
                key={i}
                justify="space-between"
                align="center"
                p={3}
                bg={txBg}
                borderRadius="lg"
              >
                <Flex align="center" gap={3}>
                  <Box
                    w={8}
                    h={8}
                    borderRadius="full"
                    bg={tx.amount > 0 ? "green.100" : "red.100"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon
                      as={tx.amount > 0 ? FiDollarSign : FiPieChart}
                      color={tx.amount > 0 ? "green.500" : "red.500"}
                      fontSize="sm"
                    />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      {tx.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {tx.date}
                    </Text>
                  </Box>
                </Flex>
                <Text
                  fontWeight="bold"
                  fontSize="sm"
                  color={tx.amount > 0 ? "green.500" : "red.500"}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount.toFixed(2)}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Decorative floating cards */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        position="absolute"
        top="-20px"
        right="-30px"
        bg={cardBg}
        borderRadius="xl"
        boxShadow="xl"
        p={4}
        zIndex={3}
        border="1px solid"
        borderColor={borderColor}
      >
        <Flex align="center" gap={3}>
          <Box bg="teal.100" p={2} borderRadius="lg">
            <Icon as={FiPieChart} color="teal.600" />
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500">
              Monthly Savings
            </Text>
            <Text fontWeight="bold" fontSize="md" color="teal.600">
              68%
            </Text>
          </Box>
        </Flex>
      </MotionBox>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        position="absolute"
        bottom="30px"
        left="-40px"
        bg={cardBg}
        borderRadius="xl"
        boxShadow="xl"
        p={4}
        zIndex={3}
        border="1px solid"
        borderColor={borderColor}
      >
        <Flex align="center" gap={3}>
          <Box bg="green.100" p={2} borderRadius="lg">
            <Icon as={FiTrendingUp} color="green.600" />
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500">
              Goal Progress
            </Text>
            <Text fontWeight="bold" fontSize="md" color="green.600">
              $4,500 / $5,000
            </Text>
          </Box>
        </Flex>
      </MotionBox>
    </Box>
  );
}
