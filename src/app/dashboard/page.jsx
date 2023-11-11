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
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session } = useSession();
  const id = session?.user?.id;
  const { data: expenses, isFetching: expenseFetching } = useShowExpense(id);
  const { data: incomes, isFetching: incomeFetching } = useShowIncome(id);
  const [...history] = transactionHistory(
    incomes?.data?.data || [],
    expenses?.data?.data || []
  );

  const incomeAmount = incomes?.data?.data || [];
  const expenseAmount = expenses?.data?.data || [];
  const bgColor = useColorModeValue("#FCF6F9", "black");

  console.log(expenseAmount);
  return (
    <Layout>
      <CustomBox>
        <Heading p="4" fontFamily={"monospace"}>
          Dashboard
        </Heading>
        <Flex
          wrap={"wrap"}
          gap={10}
          ml={{ base: 0, md: 18 }}
          justifyContent={"center"}
        >
          <Flex direction={"column"} alignItems={"center"} gap={3}>
            {incomeFetching && expenseFetching ? (
              <Skeleton
                border="2px solid #FFFFFF"
                boxShadow={"0px 1px 15px rgba(0, 0, 0, 0.06)"}
                p="1rem"
                borderRadius={"20px"}
                h={{ base: "150px", sm: "250px" }}
                w={{ base: "250px", sm: "500px" }}
              >
                <Chart />
              </Skeleton>
            ) : (
              <Chart />
            )}

            {incomeFetching && expenseFetching ? (
              [1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  padding="0.8rem"
                  w={{ base: "200px", sm: "300px" }}
                  h={"100px"}
                  mb={5}
                >
                  <Box
                    border="1px solid gray"
                    boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                    borderRadius="20px"
                    display={"flex"}
                    flexDirection={"column"}
                    justifyContent={"center"}
                    padding="0.8rem"
                    w={{ base: "200px", sm: "300px" }}
                  />
                </Skeleton>
              ))
            ) : (
              <>
                <Box
                  background={bgColor}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  padding="0.8rem"
                  w={{ base: "200px", sm: "300px" }}
                  overflowY={"hidden"}
                >
                  <Heading size="md">Total Income</Heading>
                  <Text
                    fontSize={{ base: "1.3rem", sm: "2.3rem" }}
                    fontWeight={"bold"}
                  >
                    {incomes?.data?.totalAmount}
                  </Text>
                </Box>
                <Box
                  background={bgColor}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  padding="0.8rem"
                  w={{ base: "200px", sm: "300px" }}
                  overflowY={"hidden"}
                >
                  <Heading size="md">Total Expense</Heading>
                  <Text
                    fontSize={{ base: "1.3rem", sm: "2.3rem" }}
                    fontWeight={"bold"}
                  >
                    {expenses?.data?.totalAmount}
                  </Text>
                </Box>
                <Box
                  background={bgColor}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  padding="0.8rem"
                  w={{ base: "200px", sm: "300px" }}
                  overflowY={"hidden"}
                >
                  <Heading size="md">Total Balance</Heading>
                  <Text
                    fontSize={{ base: "1.3rem", sm: "2.3rem" }}
                    fontWeight={"bold"}
                    color={"green.300"}
                  >
                    {totalBalance(
                      incomes?.data?.totalAmount,
                      expenses?.data?.totalAmount
                    )}
                  </Text>
                </Box>
              </>
            )}
          </Flex>
          <Flex direction={"column"} gap={5}>
            <Text fontSize={"2xl"} fontWeight={"bold"}>
              Recent History
            </Text>
            {incomeFetching && expenseFetching ? (
              [1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  background={bgColor}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  padding="1rem"
                  display={"flex"}
                  justifyContent="space-between"
                  alignItems="center"
                  h="55px"
                  w={{ base: "250px", sm: "450px" }}
                >
                  <Box
                    background={bgColor}
                    border="1px solid gray"
                    boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                    borderRadius="20px"
                    padding="1rem"
                    display={"flex"}
                    justifyContent="space-between"
                    alignItems="center"
                    h="55px"
                    w={{ base: "250px", sm: "450px" }}
                  />
                </Skeleton>
              ))
            ) : history.length === 0 ? (
              <>
                <Box
                  background={bgColor}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  padding="1rem"
                  display={"flex"}
                  justifyContent="space-between"
                  alignItems="center"
                  h="55px"
                  w={{ base: "250px", sm: "450px" }}
                  overflowY={"hidden"}
                >
                  <Heading size="base" color={"red.400"}>
                    No Recent History Found
                  </Heading>
                </Box>
              </>
            ) : (
              history?.map((item) => {
                return (
                  <Box
                    key={item._id}
                    background={bgColor}
                    border="1px solid gray"
                    boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                    borderRadius="20px"
                    padding="1rem"
                    display={"flex"}
                    justifyContent="space-between"
                    alignItems="center"
                    h="55px"
                    w={{ base: "250px", sm: "450px" }}
                    overflowY={"hidden"}
                  >
                    <Heading
                      size="base"
                      color={item?.type === "expense" ? "red.400" : "green.400"}
                    >
                      {item?.type === "expense"
                        ? item?.title
                        : item?.companyName}
                    </Heading>
                    <Text
                      fontSize={"1rem"}
                      fontWeight={"bold"}
                      color={item?.type === "expense" ? "red.400" : "green.400"}
                    >
                      {item?.type === "expense"
                        ? `-${item?.amount}`
                        : `+${item?.amount}`}
                    </Text>
                  </Box>
                );
              })
            )}
            <Flex justifyContent={"space-between"} mr={2} alignItems={"center"}>
              <Text fontWeight={"bold"}>Min</Text>
              <Text fontWeight={"bold"} fontSize={"2rem"}>
                Salary
              </Text>
              <Text fontWeight={"bold"}>Max</Text>
            </Flex>
            <Flex>
              {incomeFetching && expenseFetching ? (
                <Skeleton
                  background={bgColor}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  padding="1rem"
                  display={"flex"}
                  justifyContent="space-between"
                  alignItems="center"
                  h="55px"
                  w={{ base: "250px", sm: "450px" }}
                >
                  <Box
                    background={bgColor}
                    border="1px solid gray"
                    boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                    borderRadius="20px"
                    padding="1rem"
                    display={"flex"}
                    justifyContent="space-between"
                    alignItems="center"
                    h="55px"
                    w={{ base: "250px", sm: "450px" }}
                  >
                    <Text size="md" />
                    <Text size={"md"} />
                  </Box>
                </Skeleton>
              ) : (
                <Box
                  background={bgColor}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  padding="1rem"
                  display={"flex"}
                  justifyContent="space-between"
                  alignItems="center"
                  h="55px"
                  w={{ base: "250px", sm: "450px" }}
                  overflowY={"hidden"}
                >
                  <Text size="md">
                    {incomeAmount?.length === 0
                      ? 0
                      : Math.min(...incomeAmount?.map((item) => item.amount))}
                  </Text>
                  <Text size={"md"}>
                    {incomeAmount?.length === 0
                      ? 0
                      : Math.max(...incomeAmount?.map((item) => item.amount))}
                  </Text>
                </Box>
              )}
            </Flex>
            <Flex justifyContent={"space-between"} mr={2} alignItems={"center"}>
              <Text fontWeight={"bold"}>Min</Text>
              <Text fontWeight={"bold"} fontSize={"2rem"}>
                Expense
              </Text>
              <Text fontWeight={"bold"}>Max</Text>
            </Flex>
            <Flex>
              {incomeFetching && expenseFetching ? (
                <Skeleton
                  background={bgColor}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  padding="1rem"
                  display={"flex"}
                  justifyContent="space-between"
                  alignItems="center"
                  h="55px"
                  w={{ base: "250px", sm: "450px" }}
                >
                  <Box
                    background={bgColor}
                    border="1px solid gray"
                    boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                    borderRadius="20px"
                    padding="1rem"
                    display={"flex"}
                    justifyContent="space-between"
                    alignItems="center"
                    h="55px"
                    w={{ base: "250px", sm: "450px" }}
                  >
                    <Text size="md" />
                    <Text size={"md"} />
                  </Box>
                </Skeleton>
              ) : (
                <Box
                  background={bgColor}
                  border="1px solid gray"
                  boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
                  borderRadius="20px"
                  padding="1rem"
                  display={"flex"}
                  justifyContent="space-between"
                  alignItems="center"
                  h="55px"
                  w={{ base: "250px", sm: "450px" }}
                  overflowY={"hidden"}
                  mb={{ base: 5 }}
                >
                  <Text size="md">
                    {expenseAmount?.length === 0
                      ? 0
                      : Math.min(...expenseAmount?.map((item) => item.amount))}
                  </Text>
                  <Text size={"md"}>
                    {expenseAmount?.length === 0
                      ? 0
                      : Math.max(...expenseAmount?.map((item) => item.amount))}
                  </Text>
                </Box>
              )}
            </Flex>
          </Flex>
        </Flex>
      </CustomBox>
    </Layout>
  );
};

export default Dashboard;
