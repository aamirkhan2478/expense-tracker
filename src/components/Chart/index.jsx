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
  const expenses = [
    {
      title: "Part Time Job",
      amount: "30000",
      date: "07/11/2023",
    },
    {
      title: "Full Time Job",
      amount: "50000",
      date: "06/11/2023",
    },
  ];

  const incomes = [
    {
      title: "Part Time Job",
      amount: "30000",
      companyName: "Microverse",
      date: "07/11/2023",
    },
    {
      title: "Full Time Job",
      amount: "50000",
      companyName: "The Cloud Services",
      date: "06/11/2023",
    },
  ];
  const data = {
    labels: incomes.map((inc) => {
      const { date } = inc;
      return dateFormat(date);
    }),
    datasets: [
      {
        label: "Income",
        backgroundColor: "#84a9f4",
        borderColor: "#84a9f4",
        data: [
          ...incomes.map((income) => {
            const { amount } = income;
            return amount;
          }),
        ],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.2,
      },
      {
        label: "Expenses",
        data: [
          ...expenses.map((expense) => {
            const { amount } = expense;
            return amount;
          }),
        ],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
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
      h={{ base: "150px", sm:"250px" }}
      w={{ base: "250px", sm:"500px" }}
    >
      <Line data={data} style={{ height: "450px" }} />
    </Box>
  );
}

export default Chart;
