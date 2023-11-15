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
} from "chart.js";
import { Line } from "react-chartjs-2";
import dateFormat from "@/utils/dateFormat";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useShowExpense } from "@/hooks/useExpense";
import { useSession } from "next-auth/react";
import { useShowIncome } from "@/hooks/useIncome";

ChartJs.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Chart() {
  const { data: session } = useSession();
  const id = session?.user?.id;
  const { data: expenses } = useShowExpense(id || "");
  const { data: incomes } = useShowIncome(id || "");

  // Check if incomes and expenses are defined before accessing their properties
  const incomeLabels = incomes?.data?.data?.map((inc) =>
    dateFormat(inc.incomeDate)
  );
  const incomeData = incomes?.data?.data?.map((income) => income.amount);
  const expenseData = expenses?.data?.data?.map((expense) => expense.amount);

  const data = {
    labels: incomeLabels,
    datasets: [
      {
        label: "Incomes",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgb(53, 162, 235)",
        data: incomeData,
        tension: 0.2,
      },
      {
        label: "Expenses",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgb(255, 99, 132)",
        data: expenseData,
        tension: 0.2,
      },
    ],
  };

  return (
    <Box
      background={useColorModeValue("#FCF6F9", "green.100")}
      border="2px solid #FFFFFF"
      boxShadow={"0px 1px 15px rgba(0, 0, 0, 0.06)"}
      p="1rem"
      borderRadius={"20px"}
      h={{ base: "150px", sm: "200px", md: "250px" }}
      w={{ base: "250px", sm: "400px", md: "500px" }}
    >
      <Line data={data} style={{ height: "450px" }} />
    </Box>
  );
}

export default Chart;
