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
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useShowExpense } from "@/hooks/useExpense";
import { useShowIncome } from "@/hooks/useIncome";

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
        backgroundColor: "rgba(72, 187, 120, 0.2)",
        borderColor: "rgba(72, 187, 120, 1)",
        pointBackgroundColor: "rgba(72, 187, 120, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(72, 187, 120, 1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Expenses",
        data: expenseData,
        backgroundColor: "rgba(245, 101, 101, 0.2)",
        borderColor: "rgba(245, 101, 101, 1)",
        pointBackgroundColor: "rgba(245, 101, 101, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(245, 101, 101, 1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
      y: {
        grid: {
          borderDash: [5, 5],
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
    },
  };

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <Box
      background={bg}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      p="1rem"
      h="100%"
      sx={{
        width: "calc(100% - 20px)",
      }}
      borderRadius={"20px"}
    >
      <Line data={data} options={options} height="100%" width="100%" />
    </Box>
  );
}

export default Chart;
