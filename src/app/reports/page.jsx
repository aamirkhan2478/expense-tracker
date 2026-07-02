"use client";
import CustomBox from "@/components/CustomBox";
import Layout from "@/components/Layout";
import { useReportSummary, useReportTrend } from "@/hooks/useReports";
import { useSettings, formatMoney } from "@/hooks/useSettings";
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
  Select,
  Badge,
  Progress,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPieChart,
  FiArrowUp,
  FiArrowDown,
  FiCalendar,
  FiAward,
} from "react-icons/fi";
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJs.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MotionBox = motion(Box);

const MONTHS = [
  { value: "", label: "Full Year" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEARS = Array.from({ length: 6 }, (_, i) => {
  const y = new Date().getFullYear() - 3 + i;
  return { value: String(y), label: String(y) };
});

const Reports = () => {
  let id = "";
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("user"));
    id = user?.id || "";
  }

  const { settings } = useSettings();
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState("");

  const { data: summaryData, isLoading: summaryLoading } = useReportSummary(
    id,
    parseInt(selectedYear),
    selectedMonth ? parseInt(selectedMonth) : null
  );
  const { data: trendData, isLoading: trendLoading } = useReportTrend(id, parseInt(selectedYear));

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const chartText = useColorModeValue("#4A5568", "#A0AEC0");
  const chartGrid = useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.05)");
  const tooltipBg = useColorModeValue("rgba(255,255,255,0.95)", "rgba(26,32,44,0.95)");
  const tooltipText = useColorModeValue("#1A202C", "#F7FAFC");
  const progressBg = useColorModeValue("gray.100", "gray.700");

  const summary = summaryData?.data?.summary;
  const topCategories = summaryData?.data?.topCategories || [];
  const extremes = summaryData?.data?.extremes;
  const periodLabel = summaryData?.data?.period?.label || "";

  const isLoading = summaryLoading || trendLoading;

  const trendChartData = useMemo(() => {
    const trend = trendData?.data?.trend || [];
    return {
      labels: trend.map((t) => t.month),
      datasets: [
        {
          label: "Income",
          data: trend.map((t) => t.income),
          backgroundColor: "rgba(20, 184, 166, 0.8)",
          borderColor: "rgba(20, 184, 166, 1)",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Expense",
          data: trend.map((t) => t.expense),
          backgroundColor: "rgba(244, 63, 94, 0.8)",
          borderColor: "rgba(244, 63, 94, 1)",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [trendData]);

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          padding: 16,
          font: { size: 12, family: "'Inter', sans-serif", weight: "500" },
          color: chartText,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        titleFont: { family: "'Inter', sans-serif", size: 13, weight: "600" },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 12,
        borderColor: useColorModeValue("gray.100", "gray.700"),
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return ` ${context.dataset.label}: ${formatMoney(context.raw, settings)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { family: "'Inter', sans-serif" }, color: chartText },
        border: { display: false },
      },
      y: {
        grid: { borderDash: [4, 4], color: chartGrid, drawBorder: false },
        ticks: {
          font: { family: "'Inter', sans-serif" },
          color: chartText,
          callback: function (value) {
            return (settings?.currency || "$") + value;
          },
        },
        border: { display: false },
      },
    },
  };

  const StatCard = ({ title, amount, icon, colorScheme, subtitle }) => {
    const colorMap = {
      green: { bg: "green.50", iconBg: "green.500", text: "green.600" },
      red: { bg: "red.50", iconBg: "red.500", text: "red.600" },
      blue: { bg: "blue.50", iconBg: "blue.500", text: "blue.600" },
      teal: { bg: "teal.50", iconBg: "teal.500", text: "teal.600" },
    };
    const theme = colorMap[colorScheme] || colorMap.blue;

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        bg={bgCard}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        p={{ base: 5, md: 6 }}
        borderRadius="2xl"
        position="relative"
        overflow="hidden"
      >
        <Stack spacing={3} position="relative" zIndex={1}>
          <Flex justify="space-between" align="start">
            <Flex align="center" gap={3}>
              <Flex w={10} h={10} align="center" justify="center" borderRadius="xl" bg={theme.bg}>
                <Icon as={icon} w={5} h={5} color={theme.iconBg} />
              </Flex>
              <Text fontSize="sm" fontWeight="medium" color={mutedText}>
                {title}
              </Text>
            </Flex>
          </Flex>
          <Text fontSize="3xl" fontWeight="bold" color={theme.text}>
            {formatMoney(amount, settings)}
          </Text>
          {subtitle && (
            <Text fontSize="xs" color={mutedText}>
              {subtitle}
            </Text>
          )}
        </Stack>
      </MotionBox>
    );
  };

  return (
    <Layout>
      <CustomBox>
        <Stack spacing={8}>
          {/* Header with Filters */}
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Box>
              <Heading size="lg" fontWeight="bold" mb={1}>
                Reports
              </Heading>
              <Text fontSize="sm" color={mutedText}>
                Analyze your financial performance over time
              </Text>
            </Box>
            <Flex gap={3} align="center">
              <Badge
                colorScheme="teal"
                variant="subtle"
                px={4}
                py={2}
                borderRadius="xl"
                fontSize="sm"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiCalendar} />
                {periodLabel || "Select Period"}
              </Badge>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                size="sm"
                w="100px"
                borderRadius="xl"
                focusBorderColor="teal.400"
              >
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </Select>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                size="sm"
                w="140px"
                borderRadius="xl"
                focusBorderColor="teal.400"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Flex>
          </Flex>

          {/* Summary Cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
            <StatCard
              title="Total Income"
              amount={summary?.totalIncome || 0}
              icon={FiTrendingUp}
              colorScheme="green"
              subtitle={`${summary?.incomeCount || 0} transactions`}
            />
            <StatCard
              title="Total Expense"
              amount={summary?.totalExpense || 0}
              icon={FiTrendingDown}
              colorScheme="red"
              subtitle={`${summary?.expenseCount || 0} transactions`}
            />
            <StatCard
              title="Net Savings"
              amount={summary?.netSavings || 0}
              icon={FiDollarSign}
              colorScheme={summary?.netSavings >= 0 ? "teal" : "red"}
              subtitle={summary?.netSavings >= 0 ? "Great job!" : "Spending more than earning"}
            />
            <StatCard
              title="Savings Rate"
              amount={summary?.savingsRate || 0}
              icon={FiPieChart}
              colorScheme="blue"
              subtitle="Of total income"
            />
          </SimpleGrid>

          {/* Main Content */}
          <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={{ base: 6, md: 8 }}>
            {/* Left: Trend Chart */}
            <GridItem>
              <Box
                bg={bgCard}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                p={6}
                boxShadow="sm"
              >
                <Flex justify="space-between" align="center" mb={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={1}>
                      Financial Overview
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      Monthly Trend
                    </Text>
                  </Box>
                  <Badge
                    colorScheme="teal"
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="medium"
                  >
                    {selectedYear}
                  </Badge>
                </Flex>
                {trendLoading ? (
                  <Skeleton height="300px" borderRadius="xl" />
                ) : (
                  <Box h="300px" w="100%">
                    <Bar data={trendChartData} options={trendOptions} />
                  </Box>
                )}
              </Box>
            </GridItem>

            {/* Right: Top Categories + Extremes */}
            <GridItem>
              <Stack spacing={6}>
                {/* Top Categories */}
                <Box>
                  <Heading size="md" fontWeight="bold" mb={4}>
                    Top Spending Categories
                  </Heading>
                  {summaryLoading ? (
                    <Stack spacing={3}>
                      <Skeleton height="60px" borderRadius="xl" />
                      <Skeleton height="60px" borderRadius="xl" />
                      <Skeleton height="60px" borderRadius="xl" />
                    </Stack>
                  ) : topCategories.length === 0 ? (
                    <Box
                      p={6}
                      textAlign="center"
                      borderRadius="xl"
                      border="1px dashed"
                      borderColor={borderColor}
                    >
                      <Icon as={FiPieChart} boxSize={6} color="gray.300" mb={2} />
                      <Text fontSize="sm" color={mutedText}>
                        No expense data for this period
                      </Text>
                    </Box>
                  ) : (
                    <Stack spacing={3}>
                      {topCategories.map((cat, i) => {
                        const colors = ["teal", "red", "blue", "amber", "green"];
                        const color = colors[i % colors.length];
                        return (
                          <MotionBox
                            key={cat.categoryId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            bg={bgCard}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="xl"
                            p={4}
                          >
                            <Flex justify="space-between" align="center" mb={2}>
                              <Text fontWeight="semibold" fontSize="sm">
                                {i + 1}. {cat.name}
                              </Text>
                              <Badge colorScheme={color} variant="subtle" borderRadius="full">
                                {cat.percentage}%
                              </Badge>
                            </Flex>
                            <Progress
                              value={cat.percentage}
                              size="sm"
                              colorScheme={color}
                              borderRadius="full"
                              bg={progressBg}
                              mb={1}
                            />
                            <Flex justify="space-between" fontSize="xs" color={mutedText}>
                              <Text>{cat.count} transactions</Text>
                              <Text fontWeight="medium">{formatMoney(cat.amount, settings)}</Text>
                            </Flex>
                          </MotionBox>
                        );
                      })}
                    </Stack>
                  )}
                </Box>

                {/* Transaction Extremes */}
                <Box>
                  <Heading size="md" fontWeight="bold" mb={4}>
                    Highlights
                  </Heading>
                  {summaryLoading ? (
                    <Stack spacing={3}>
                      <Skeleton height="60px" borderRadius="xl" />
                      <Skeleton height="60px" borderRadius="xl" />
                    </Stack>
                  ) : (
                    <Stack spacing={3}>
                      {extremes?.highestExpense && (
                        <Box
                          bg={bgCard}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="xl"
                          p={4}
                        >
                          <Flex align="center" gap={2} mb={1}>
                            <Icon as={FiArrowUp} color="red.500" />
                            <Text fontSize="xs" fontWeight="bold" color="red.500" textTransform="uppercase">
                              Highest Expense
                            </Text>
                          </Flex>
                          <Text fontWeight="semibold" fontSize="sm">
                            {extremes.highestExpense.title}
                          </Text>
                          <Text fontSize="sm" color={mutedText}>
                            {formatMoney(extremes.highestExpense.amount, settings)} ·{" "}
                            {new Date(extremes.highestExpense.date).toLocaleDateString()}
                          </Text>
                        </Box>
                      )}
                      {extremes?.lowestExpense && (
                        <Box
                          bg={bgCard}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="xl"
                          p={4}
                        >
                          <Flex align="center" gap={2} mb={1}>
                            <Icon as={FiArrowDown} color="green.500" />
                            <Text fontSize="xs" fontWeight="bold" color="green.500" textTransform="uppercase">
                              Lowest Expense
                            </Text>
                          </Flex>
                          <Text fontWeight="semibold" fontSize="sm">
                            {extremes.lowestExpense.title}
                          </Text>
                          <Text fontSize="sm" color={mutedText}>
                            {formatMoney(extremes.lowestExpense.amount, settings)} ·{" "}
                            {new Date(extremes.lowestExpense.date).toLocaleDateString()}
                          </Text>
                        </Box>
                      )}
                      {extremes?.highestIncome && (
                        <Box
                          bg={bgCard}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="xl"
                          p={4}
                        >
                          <Flex align="center" gap={2} mb={1}>
                            <Icon as={FiAward} color="teal.500" />
                            <Text fontSize="xs" fontWeight="bold" color="teal.500" textTransform="uppercase">
                              Highest Income
                            </Text>
                          </Flex>
                          <Text fontWeight="semibold" fontSize="sm">
                            {extremes.highestIncome.title}
                          </Text>
                          <Text fontSize="sm" color={mutedText}>
                            {formatMoney(extremes.highestIncome.amount, settings)} ·{" "}
                            {new Date(extremes.highestIncome.date).toLocaleDateString()}
                          </Text>
                        </Box>
                      )}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </GridItem>
          </Grid>

          {/* Additional Stats Row */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} pt={4}>
            {[
              {
                label: "Avg Income",
                value: summary?.avgIncome || 0,
                color: "green",
              },
              {
                label: "Avg Expense",
                value: summary?.avgExpense || 0,
                color: "red",
              },
              {
                label: "Max Income",
                value: summary?.maxIncome || 0,
                color: "green",
              },
              {
                label: "Max Expense",
                value: summary?.maxExpense || 0,
                color: "red",
              },
            ].map((stat, i) => (
              <MotionBox
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                bg={bgCard}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                p={5}
                textAlign="center"
              >
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  color={mutedText}
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={2}
                >
                  {stat.label}
                </Text>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={stat.color === "green" ? "green.500" : "red.500"}
                >
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

export default Reports;
