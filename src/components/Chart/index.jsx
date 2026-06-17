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
import { Line } from "react-chartjs-2";
import dateFormat from "@/utils/dateFormat";
import { useSettings } from "@/hooks/useSettings";
import { Box, useColorModeValue, Text, Flex } from "@chakra-ui/react";
import { useShowExpense } from "@/hooks/useExpense";
import { useShowIncome } from "@/hooks/useIncome";
import { FiTrendingUp } from "react-icons/fi";

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

function Chart() {
  let id = "";
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("user"));
    id = user?.id || "";
  }
  const { data: expenses } = useShowExpense(id || "");
  const { data: incomes } = useShowIncome(id || "");

  const isDark = useColorModeValue(false, true);
  const textColor = useColorModeValue("#4A5568", "#A0AEC0");
  const gridColor = useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.05)");
  const tooltipBg = useColorModeValue("rgba(255,255,255,0.95)", "rgba(26,32,44,0.95)");
  const tooltipText = useColorModeValue("#1A202C", "#F7FAFC");

  const { settings } = useSettings();

  const incomeLabels = incomes?.data?.data?.map((inc) =>
    dateFormat(inc.incomeDate),
  );
  const incomeData = incomes?.data?.data?.map((income) => income.amount);
  const expenseData = expenses?.data?.data?.map((expense) => expense.amount);

  const data = {
    labels: incomeLabels,
    datasets: [
      {
        label: "Incomes",
        data: incomeData,
        backgroundColor: "rgba(20, 184, 166, 0.1)",
        borderColor: "rgba(20, 184, 166, 1)",
        pointBackgroundColor: "rgba(20, 184, 166, 1)",
        pointBorderColor: useColorModeValue("#fff", "#1A202C"),
        pointHoverBackgroundColor: useColorModeValue("#fff", "#1A202C"),
        pointHoverBorderColor: "rgba(20, 184, 166, 1)",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Expenses",
        data: expenseData,
        backgroundColor: "rgba(244, 63, 94, 0.1)",
        borderColor: "rgba(244, 63, 94, 1)",
        pointBackgroundColor: "rgba(244, 63, 94, 1)",
        pointBorderColor: useColorModeValue("#fff", "#1A202C"),
        pointHoverBackgroundColor: useColorModeValue("#fff", "#1A202C"),
        pointHoverBorderColor: "rgba(244, 63, 94, 1)",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: "500",
          },
          color: textColor,
        },
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
        displayColors: true,
        borderColor: useColorModeValue("gray.100", "gray.700"),
        borderWidth: 1,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: textColor,
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          borderDash: [4, 4],
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: textColor,
          padding: 8,
          callback: function (value) {
            return (settings?.currency || "$") + value;
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      border="1px solid"
      borderColor={useColorModeValue("gray.100", "gray.700")}
      boxShadow="sm"
      p={6}
      h="100%"
      borderRadius="2xl"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={1}>
            Financial Overview
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            Income vs Expense
          </Text>
        </Box>
        <Box
          bg={useColorModeValue("green.50", "green.900")}
          color="green.500"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <FiTrendingUp size={12} />
          Live Data
        </Box>
      </Flex>
      <Box h={{ base: "250px", md: "320px" }} w="100%">
        <Line data={data} options={options} height="100%" width="100%" />
      </Box>
    </Box>
  );
}

export default Chart;
