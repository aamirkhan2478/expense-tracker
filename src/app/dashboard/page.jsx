"use client";
import Chart from "@/components/Chart";
import CustomBox from "@/components/CustomBox";
import Layout from "@/components/Layout";
import { useShowExpense } from "@/hooks/useExpense";
import { useShowIncome } from "@/hooks/useIncome";
import { totalBalance, transactionHistory } from "@/logic/calculations";
import {
  Box,
  Flex,
  Heading,
  Skeleton,
  Text,
  useColorModeValue,
  SimpleGrid,
  Grid,
  GridItem,
  Icon,
  Stack,
  Spacer,
} from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";

const Dashboard = () => {
  let id = "";
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("user"));
    id = user?.id || "";
  }

  const { data: expenses, isLoading: expenseFetching } = useShowExpense(id);
  const { data: incomes, isLoading: incomeFetching } = useShowIncome(id);

  const [...history] = transactionHistory(
    incomes?.data?.data || [],
    expenses?.data?.data || [],
  );

  const incomeAmount = incomes?.data?.data || [];
  const expenseAmount = expenses?.data?.data || [];

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  const StatCard = ({ title, amount, icon, color, isLoading }) => {
    // Extract the color name (e.g., "green" from "green.400")
    const colorName = color.split(".")[0];
    const iconBg = useColorModeValue(`${colorName}.100`, `${colorName}.900`);

    return (
      <Box
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        p={6}
        borderRadius="2xl"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        {isLoading ? (
          <Skeleton height="40px" width="80%" />
        ) : (
          <>
            <Flex alignItems="center" mb={2}>
              <Icon
                as={icon}
                w={6}
                h={6}
                color={color}
                mr={3}
                p={1}
                bg={iconBg}
                borderRadius="md"
              />
              <Heading size="sm" color="gray.500" fontWeight="medium">
                {title}
              </Heading>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color={color}>
              {amount}
            </Text>
          </>
        )}
      </Box>
    );
  };

  const HistoryItem = ({ item }) => (
    <Flex
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      p={4}
      borderRadius="xl"
      justifyContent="space-between"
      alignItems="center"
      mb={3}
    >
      <Text
        fontWeight="medium"
        color={item.type === "expense" ? "red.500" : "green.500"}
      >
        {item.type === "expense" ? item.title : item.companyName}
      </Text>
      <Text
        fontWeight="bold"
        color={item.type === "expense" ? "red.500" : "green.500"}
      >
        {item.type === "expense" ? `-${item.amount}` : `+${item.amount}`}
      </Text>
    </Flex>
  );

  const MinMaxStat = ({ label, min, max, icon, color }) => (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      p={4}
      borderRadius="xl"
      mb={4}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <Text fontWeight="bold" fontSize="lg">
          {label}
        </Text>
        <Icon as={icon} color={color} />
      </Flex>
      <Flex justifyContent="space-between" fontSize="sm" color="gray.500">
        <Text>Min</Text>
        <Text>Max</Text>
      </Flex>
      <Flex justifyContent="space-between" fontWeight="bold" fontSize="lg">
        <Text>{min}</Text>
        <Text>{max}</Text>
      </Flex>
    </Box>
  );

  const isLoading = incomeFetching || expenseFetching;

  return (
    <Layout>
      <CustomBox>
        <Stack spacing={{ base: 6, md: 8 }} width="100%" p={{ base: 3, md: 6 }}>
          <Box>
            <Heading
              size={{ base: "md", md: "lg" }}
              mb={6}
              fontFamily="'Inter', sans-serif"
            >
              Dashboard
            </Heading>

            {/* Stats Grid */}
            <SimpleGrid
              columns={{ base: 1, sm: 2, lg: 3 }}
              spacing={{ base: 4, md: 6 }}
              mb={8}
            >
              <StatCard
                title="Total Income"
                amount={incomes?.data?.totalAmount || 0}
                icon={FiTrendingUp}
                color="green.400"
                isLoading={isLoading}
              />
              <StatCard
                title="Total Expense"
                amount={expenses?.data?.totalAmount || 0}
                icon={FiTrendingDown}
                color="red.400"
                isLoading={isLoading}
              />
              <StatCard
                title="Total Balance"
                amount={totalBalance(
                  incomes?.data?.totalAmount,
                  expenses?.data?.totalAmount,
                )}
                icon={FiDollarSign}
                color="blue.400"
                isLoading={isLoading}
              />
            </SimpleGrid>

            {/* Main Content Grid */}
            <Grid
              templateColumns={{ base: "1fr", lg: "3fr 2fr" }}
              gap={{ base: 6, md: 8 }}
            >
              {/* Chart Section */}
              <GridItem>
                <Box h={{ base: "300px", md: "400px" }} w="100%">
                  {isLoading ? (
                    <Skeleton height="100%" borderRadius="2xl" />
                  ) : (
                    <Chart />
                  )}
                </Box>
              </GridItem>

              {/* History & Mini Stats Section */}
              <GridItem>
                <Stack spacing={6}>
                  <Box>
                    <Heading size="md" mb={4}>
                      Recent History
                    </Heading>
                    {isLoading ? (
                      <Stack>
                        <Skeleton height="50px" borderRadius="xl" />
                        <Skeleton height="50px" borderRadius="xl" />
                        <Skeleton height="50px" borderRadius="xl" />
                      </Stack>
                    ) : history.length === 0 ? (
                      <Box
                        p={4}
                        textAlign="center"
                        color="gray.500"
                        bg={bg}
                        borderRadius="xl"
                        border="1px dashed"
                        borderColor="gray.300"
                      >
                        No transaction history
                      </Box>
                    ) : (
                      history
                        .slice(0, 3)
                        .map((item) => (
                          <HistoryItem key={item._id} item={item} />
                        ))
                    )}
                  </Box>

                  <Box>
                    <Heading size="md" mb={4}>
                      Overview
                    </Heading>
                    <MinMaxStat
                      label="Income"
                      min={
                        incomeAmount.length > 0
                          ? Math.min(...incomeAmount.map((i) => i.amount))
                          : 0
                      }
                      max={
                        incomeAmount.length > 0
                          ? Math.max(...incomeAmount.map((i) => i.amount))
                          : 0
                      }
                      icon={FiTrendingUp}
                      color="green.400"
                    />
                    <MinMaxStat
                      label="Expense"
                      min={
                        expenseAmount.length > 0
                          ? Math.min(...expenseAmount.map((e) => e.amount))
                          : 0
                      }
                      max={
                        expenseAmount.length > 0
                          ? Math.max(...expenseAmount.map((e) => e.amount))
                          : 0
                      }
                      icon={FiTrendingDown}
                      color="red.400"
                    />
                  </Box>
                </Stack>
              </GridItem>
            </Grid>
          </Box>
        </Stack>
      </CustomBox>
    </Layout>
  );
};

export default Dashboard;
