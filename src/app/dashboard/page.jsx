"use client";
import Chart from "@/components/Chart";
import CustomBox from "@/components/CustomBox";
import Layout from "@/components/Layout";
import { useShowExpense, useBudgetSummary } from "@/hooks/useExpense";
import { useShowIncome } from "@/hooks/useIncome";
import { useSettings, formatMoney } from "@/hooks/useSettings";
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
  Progress,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownRight,
  FiClock,
  FiActivity,
  FiPieChart,
  FiTarget,
} from "react-icons/fi";
import { useEffect, useState } from "react";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser(null);
        }
      }
    }
  }, []);

  let id = "";
  if (typeof window !== "undefined") {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    id = storedUser?.id || "";
  }

  const { settings } = useSettings();
  const { data: expenses, isLoading: expenseFetching } = useShowExpense(id);
  const { data: incomes, isLoading: incomeFetching } = useShowIncome(id);
  const { data: budgetData, isLoading: budgetFetching } = useBudgetSummary(id);

  const history = transactionHistory(
    incomes?.data?.data || [],
    expenses?.data?.data || [],
  );

  const incomeAmount = incomes?.data?.data || [];
  const expenseAmount = expenses?.data?.data || [];

  const isLoading = incomeFetching || expenseFetching;

  const totalIncome = incomes?.data?.totalAmount || 0;
  const totalExpense = expenses?.data?.totalAmount || 0;
  const balance = totalBalance(totalIncome, totalExpense);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const progressBg = useColorModeValue("gray.100", "gray.700");

  const StatCard = ({ title, amount, icon, colorScheme, trend, isLoading }) => {
    const colorMap = {
      green: { bg: "green.50", iconBg: "green.500", text: "green.600", lightBg: "#ECFDF5" },
      red: { bg: "red.50", iconBg: "red.500", text: "red.600", lightBg: "#FEF2F2" },
      blue: { bg: "blue.50", iconBg: "blue.500", text: "blue.600", lightBg: "#EFF6FF" },
      teal: { bg: "teal.50", iconBg: "teal.500", text: "teal.600", lightBg: "#F0FDFA" },
    };
    const theme = colorMap[colorScheme] || colorMap.blue;

    return (
      <MotionBox
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.4 }}
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        p={{ base: 5, md: 6 }}
        borderRadius="2xl"
        position="relative"
        overflow="hidden"
        whileHover={{ boxShadow: "md", y: -2 }}
      >
        <Box
          position="absolute"
          top="-20px"
          right="-20px"
          w="100px"
          h="100px"
          borderRadius="full"
          bg={theme.lightBg}
          opacity="0.5"
        />
        {isLoading ? (
          <Stack spacing={3}>
            <Skeleton height="20px" width="60%" />
            <Skeleton height="36px" width="80%" />
          </Stack>
        ) : (
          <Stack spacing={3} position="relative" zIndex={1}>
            <Flex justify="space-between" align="start">
              <Flex align="center" gap={3}>
                <Flex
                  w={10}
                  h={10}
                  align="center"
                  justify="center"
                  borderRadius="xl"
                  bg={theme.bg}
                >
                  <Icon as={icon} w={5} h={5} color={theme.iconBg} />
                </Flex>
                <Text fontSize="sm" fontWeight="medium" color={mutedText}>
                  {title}
                </Text>
              </Flex>
              {trend && (
                <Badge
                  colorScheme={trend > 0 ? "green" : "red"}
                  variant="subtle"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="xs"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Icon
 as={trend > 0 ? FiArrowUpRight : FiArrowDownRight}
                    boxSize={3}
                  />
                  {Math.abs(trend)}%
                </Badge>
              )}
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color={theme.text}>
              {formatMoney(amount, settings)}
            </Text>
          </Stack>
        )}
      </MotionBox>
    );
  };

  const TransactionItem = ({ item }) => {
    const isExpense = item.type === "expense";
    const name = isExpense ? item.title : item.companyName;
    const category = item.category?.name || "Uncategorized";

    return (
      <MotionFlex
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        p={4}
        borderRadius="xl"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        whileHover={{ boxShadow: "md" }}
        transition={{ duration: 0.2 }}
      >
        <Flex align="center" gap={3}>
          <Flex
            w={10}
            h={10}
            borderRadius="xl"
            bg={isExpense ? "red.50" : "green.50"}
            align="center"
            justify="center"
          >
            <Icon
              as={isExpense ? FiTrendingDown : FiTrendingUp}
              color={isExpense ? "red.500" : "green.500"}
            />
          </Flex>
          <Stack spacing={0}>
            <Text fontWeight="semibold" fontSize="sm" color={isExpense ? "red.500" : "green.500"}>
              {name}
            </Text>
            <Text fontSize="xs" color={mutedText}>
              {category}
            </Text>
          </Stack>
        </Flex>
        <Stack spacing={0} align="end">
          <Text fontWeight="bold" fontSize="md" color={isExpense ? "red.500" : "green.500"}>
            {isExpense ? "-" : "+"}{formatMoney(item.amount, settings)}
          </Text>
          <Text fontSize="xs" color={mutedText}>
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </Stack>
      </MotionFlex>
    );
  };

  const InsightCard = ({ label, value, total, colorScheme, icon }) => {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    const colors = {
      green: { bar: "green", bg: "green.50", text: "green.600" },
      red: { bar: "red", bg: "red.50", text: "red.600" },
    };
    const c = colors[colorScheme] || colors.green;

    return (
      <Box
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        p={5}
        borderRadius="xl"
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Flex align="center" gap={2}>
            <Icon as={icon} color={c.text} />
            <Text fontWeight="semibold" fontSize="sm">
              {label}
            </Text>
          </Flex>
          <Text fontSize="xs" fontWeight="bold" color={c.text} bg={c.bg} px={2} py={0.5} borderRadius="full">
            {percent}%
          </Text>
        </Flex>
        <Progress
          value={percent}
          size="sm"
          colorScheme={c.bar}
          borderRadius="full"
          bg={useColorModeValue("gray.100", "gray.700")}
          mb={2}
        />
        <Flex justify="space-between" fontSize="xs" color={mutedText}>
          <Text>{formatMoney(value, settings)}</Text>
          <Text>of {formatMoney(total, settings)}</Text>
        </Flex>
      </Box>
    );
  };

  return (
    <Layout>
      <CustomBox>
        <Stack spacing={{ base: 6, md: 8 }} width="100%">
          {/* Header */}
          <MotionFlex
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Box>
              <Text fontSize="sm" color={mutedText} mb={1}>
                Welcome back,
              </Text>
              <Heading size={{ base: "md", md: "lg" }} fontWeight="bold">
                {user?.name ? `${user.name}'s Dashboard` : "Dashboard"}
              </Heading>
            </Box>
            <Flex
              align="center"
              gap={2}
              bg={useColorModeValue("teal.50", "teal.900")}
              color="teal.600"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
            >
              <FiClock size={14} />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Flex>
          </MotionFlex>

          {/* Stats Grid */}
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            spacing={{ base: 4, md: 6 }}
          >
            <StatCard
              title="Total Income"
              amount={totalIncome}
              icon={FiTrendingUp}
              colorScheme="green"
              trend={12}
              isLoading={isLoading}
            />
            <StatCard
              title="Total Expense"
              amount={totalExpense}
              icon={FiTrendingDown}
              colorScheme="red"
              trend={-5}
              isLoading={isLoading}
            />
            <StatCard
              title="Total Balance"
              amount={balance}
              icon={FiDollarSign}
              colorScheme="teal"
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
              {isLoading ? (
                <Box
                  bg={bg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  p={6}
                  h={{ base: "300px", md: "400px" }}
                >
                  <Skeleton height="20px" width="40%" mb={4} />
                  <Skeleton height="calc(100% - 40px)" borderRadius="xl" />
                </Box>
              ) : (
                <Chart />
              )}
            </GridItem>

            {/* Right Panel */}
            <GridItem>
              <Stack spacing={6}>
                {/* Recent Transactions */}
                <Box>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" fontWeight="bold">
                      Recent Transactions
                    </Heading>
                    <Text fontSize="sm" color="teal.500" fontWeight="medium" cursor="pointer">
                      View All
                    </Text>
                  </Flex>
                  {isLoading ? (
                    <Stack>
                      <Skeleton height="70px" borderRadius="xl" />
                      <Skeleton height="70px" borderRadius="xl" />
                      <Skeleton height="70px" borderRadius="xl" />
                    </Stack>
                  ) : history.length === 0 ? (
                    <Box
                      p={8}
                      textAlign="center"
                      color={mutedText}
                      bg={bg}
                      borderRadius="xl"
                      border="1px dashed"
                      borderColor={borderColor}
                    >
                      <Icon as={FiActivity} boxSize={8} mb={3} color="gray.300" />
                      <Text fontWeight="medium">No transactions yet</Text>
                      <Text fontSize="sm">Add your first income or expense to get started</Text>
                    </Box>
                  ) : (
                    history.map((item) => (
                      <TransactionItem key={item._id} item={item} />
                    ))
                  )}
                </Box>

                {/* Spending Insights */}
                <Box>
                  <Heading size="md" fontWeight="bold" mb={4}>
                    Spending Insights
                  </Heading>
                  {isLoading ? (
                    <Stack spacing={4}>
                      <Skeleton height="80px" borderRadius="xl" />
                      <Skeleton height="80px" borderRadius="xl" />
                    </Stack>
                  ) : (
                    <Stack spacing={4}>
                      <InsightCard
                        label="Income Allocation"
                        value={totalIncome}
                        total={totalIncome + totalExpense}
                        colorScheme="green"
                        icon={FiTrendingUp}
                      />
                      <InsightCard
                        label="Expense Ratio"
                        value={totalExpense}
                        total={totalIncome + totalExpense}
                        colorScheme="red"
                        icon={FiPieChart}
                      />
                    </Stack>
                  )}
                </Box>

                {/* Budget vs Actual */}
                <Box>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" fontWeight="bold">
                      Budget vs Actual
                    </Heading>
                    <Text fontSize="xs" color={mutedText}>
                      {budgetData?.data?.month || "This Month"}
                    </Text>
                  </Flex>
                  {budgetFetching ? (
                    <Stack spacing={4}>
                      <Skeleton height="80px" borderRadius="xl" />
                      <Skeleton height="80px" borderRadius="xl" />
                    </Stack>
                  ) : budgetData?.data?.summary?.length === 0 ? (
                    <Box
                      p={6}
                      textAlign="center"
                      borderRadius="xl"
                      border="1px dashed"
                      borderColor={borderColor}
                    >
                      <Icon as={FiTarget} boxSize={6} color="gray.300" mb={2} />
                      <Text fontSize="sm" color={mutedText}>
                        No budgets set yet
                      </Text>
                      <Text fontSize="xs" color={mutedText}>
                        Go to Categories to set monthly budgets
                      </Text>
                    </Box>
                  ) : (
                    <Stack spacing={4}>
                      {budgetData?.data?.summary?.map((item) => {
                        const pct = Math.min(item.percentage, 100);
                        const color =
                          item.percentage >= 100
                            ? "red"
                            : item.percentage >= 80
                            ? "orange"
                            : item.percentage >= 50
                            ? "yellow"
                            : "green";
                        return (
                          <Box
                            key={item.categoryId}
                            bg={bg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="xl"
                            p={4}
                          >
                            <Flex justify="space-between" align="center" mb={2}>
                              <Flex align="center" gap={2}>
                                <Text fontWeight="semibold" fontSize="sm">
                                  {item.name}
                                </Text>
                                {item.overBudget && (
                                  <Badge colorScheme="red" variant="subtle" borderRadius="full" fontSize="xs">
                                    Over Budget
                                  </Badge>
                                )}
                              </Flex>
                              <Text fontSize="xs" fontWeight="bold" color={`${color}.500`}>
                                {item.percentage}%
                              </Text>
                            </Flex>
                            <Progress
                              value={pct}
                              size="sm"
                              colorScheme={color}
                              borderRadius="full"
                              bg={progressBg}
                              mb={2}
                            />
                            <Flex justify="space-between" fontSize="xs" color={mutedText}>
                              <Text>Spent: {formatMoney(item.spent, settings)}</Text>
                              <Text>Budget: {formatMoney(item.budget, settings)}</Text>
                            </Flex>
                            {item.remaining > 0 && (
                              <Text fontSize="xs" color="green.500" mt={1}>
                                {formatMoney(item.remaining, settings)} remaining
                              </Text>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </GridItem>
          </Grid>

          {/* Quick Stats Row */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} pt={4}>
            {[
              {
                label: "Min Income",
                value: incomeAmount.length > 0 ? Math.min(...incomeAmount.map((i) => i.amount)) : 0,
                color: "green",
              },
              {
                label: "Max Income",
                value: incomeAmount.length > 0 ? Math.max(...incomeAmount.map((i) => i.amount)) : 0,
                color: "green",
              },
              {
                label: "Avg Expense",
                value:
                  expenseAmount.length > 0
                    ? Math.round(
                        expenseAmount.reduce((a, b) => a + b.amount, 0) / expenseAmount.length
                      )
                    : 0,
                color: "red",
              },
            ].map((stat, i) => (
              <MotionBox
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                bg={bg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                p={5}
                textAlign="center"
              >
                <Text fontSize="xs" fontWeight="medium" color={mutedText} textTransform="uppercase" letterSpacing="wider" mb={2}>
                  {stat.label}
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={stat.color === "green" ? "green.500" : "red.500"}>
                  {formatMoney(stat.value, settings)}
                </Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Stack>
      </CustomBox>
    </Layout>
  );
};

export default Dashboard;
