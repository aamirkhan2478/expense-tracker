"use client";
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  Box,
  Text,
  Flex,
  useColorModeValue,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";
import { useExpensesByCategory } from "@/hooks/useExpense";
import { useSettings, formatMoney } from "@/hooks/useSettings";
import { FiPieChart } from "react-icons/fi";
import { useState, useEffect } from "react";

ChartJs.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

const CATEGORY_COLORS = [
  { bg: "rgba(20, 184, 166, 0.85)", border: "rgba(20, 184, 166, 1)" }, // teal
  { bg: "rgba(244, 63, 94, 0.85)", border: "rgba(244, 63, 94, 1)" }, // rose
  { bg: "rgba(59, 130, 246, 0.85)", border: "rgba(59, 130, 246, 1)" }, // blue
  { bg: "rgba(245, 158, 11, 0.85)", border: "rgba(245, 158, 11, 1)" }, // amber
  { bg: "rgba(16, 185, 129, 0.85)", border: "rgba(16, 185, 129, 1)" }, // green
  { bg: "rgba(139, 92, 246, 0.85)", border: "rgba(139, 92, 246, 1)" }, // violet
  { bg: "rgba(236, 72, 153, 0.85)", border: "rgba(236, 72, 153, 1)" }, // pink
  { bg: "rgba(99, 102, 241, 0.85)", border: "rgba(99, 102, 241, 1)" }, // indigo
  { bg: "rgba(249, 115, 22, 0.85)", border: "rgba(249, 115, 22, 1)" }, // orange
  { bg: "rgba(6, 182, 212, 0.85)", border: "rgba(6, 182, 212, 1)" }, // cyan
];

function PieChart() {
  let id = "";
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("user"));
    id = user?.id || "";
  }

  const { data } = useExpensesByCategory(id || "");
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("#4A5568", "#A0AEC0");
  const tooltipBg = useColorModeValue(
    "rgba(255,255,255,0.95)",
    "rgba(26,32,44,0.95)",
  );
  const tooltipText = useColorModeValue("#1A202C", "#F7FAFC");

  const categoryData = data?.data?.data || [];

  const chartData = {
    labels: categoryData.map((item) => item.name),
    datasets: [
      {
        data: categoryData.map((item) => item.amount),
        backgroundColor: categoryData.map(
          (_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length].bg,
        ),
        borderColor: categoryData.map(
          (_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length].border,
        ),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: "600",
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        padding: 12,
        cornerRadius: 12,
        borderColor: useColorModeValue("gray.100", "gray.700"),
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const item = categoryData[context.dataIndex];
            return ` ${item.name}: ${formatMoney(item.amount, settings)} (${item.percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      p={6}
      sx={{
        width: "calc(100% - 22px)",
      }}
      borderRadius="2xl"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={1}>
            Spending Breakdown
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            By Category
          </Text>
        </Box>
        <Box
          bg={useColorModeValue("teal.50", "teal.900")}
          color="teal.600"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <FiPieChart size={12} />
          This Month
        </Box>
      </Flex>

      {categoryData.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={10}
          color={textColor}
        >
          <FiPieChart size={40} opacity={0.3} />
          <Text mt={3} fontSize="sm" fontWeight="medium">
            No expense data yet
          </Text>
          <Text fontSize="xs" opacity={0.6}>
            Add expenses to see your breakdown
          </Text>
        </Flex>
      ) : (
        <Flex direction={{ base: "column", md: "row" }} align="center" gap={6}>
          <Box
            h={{ base: "200px", md: "240px" }}
            w={{ base: "200px", md: "240px" }}
            position="relative"
          >
            {!mounted ? (
              <Skeleton height="100%" width="100%" borderRadius="full" />
            ) : (
              <Doughnut data={chartData} options={options} />
            )}
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              align="center"
              justify="center"
              direction="column"
              pointerEvents="none"
            >
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                Total
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="teal.500">
                {formatMoney(data?.data?.totalAmount || 0, settings)}
              </Text>
            </Flex>
          </Box>

          <SimpleGrid columns={1} spacing={3} flex={1} w="full">
            {categoryData.slice(0, 6).map((item, i) => (
              <Flex key={item.categoryId} align="center" gap={3}>
                <Box
                  w={3}
                  h={3}
                  borderRadius="full"
                  bg={CATEGORY_COLORS[i % CATEGORY_COLORS.length].border}
                  flexShrink={0}
                />
                <Text fontSize="sm" fontWeight="medium" flex={1} isTruncated>
                  {item.name}
                </Text>
                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                  {item.percentage}%
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  minW="60px"
                  textAlign="right"
                >
                  {formatMoney(item.amount, settings)}
                </Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Flex>
      )}
    </Box>
  );
}

export default PieChart;
