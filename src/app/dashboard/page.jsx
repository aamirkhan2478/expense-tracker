"use client";
import Chart from "@/components/Chart";
import CustomBox from "@/components/CustomBox";
import Layout from "@/components/Layout";
import { Box, Flex, Heading, Text, useColorModeValue } from "@chakra-ui/react";

const Dashboard = () => {
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
            <Chart />
            <Box
              background={useColorModeValue("#FCF6F9", "black")}
              border="1px solid gray"
              boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
              borderRadius="20px"
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              padding="0.8rem"
              w={"300px"}
              overflowY={'hidden'}
            >
              <Heading size="md">Total Income</Heading>
              <Text fontSize={"2.3rem"} fontWeight={"bold"}>
                10000
              </Text>
            </Box>
            <Box
              background={useColorModeValue("#FCF6F9", "black")}
              border="1px solid gray"
              boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
              borderRadius="20px"
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              padding="0.8rem"
              w={"300px"}
              overflowY={'hidden'}
            >
              <Heading size="md">Total Expense</Heading>
              <Text fontSize={"2.3rem"} fontWeight={"bold"}>
                10000
              </Text>
            </Box>
            <Box
              background={useColorModeValue("#FCF6F9", "black")}
              border="1px solid gray"
              boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
              borderRadius="20px"
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              padding="0.8rem"
              w={"300px"}
              overflowY={'hidden'}
            >
              <Heading size="md">Total Balance</Heading>
              <Text fontSize={"2.3rem"} fontWeight={"bold"} color={"green.300"}>
                20000
              </Text>
            </Box>
          </Flex>
          <Flex direction={"column"} gap={5}>
            <Text fontSize={"2xl"} fontWeight={"bold"}>
              Recent History
            </Text>
            <Box
              background={useColorModeValue("#FCF6F9", "black")}
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
              <Heading size="base">Total Income</Heading>
              <Text fontSize={"1rem"} fontWeight={"bold"}>
                10000
              </Text>
            </Box>
            <Box
              background={useColorModeValue("#FCF6F9", "black")}
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
              <Heading size="base">Total Income</Heading>
              <Text fontSize={"1rem"} fontWeight={"bold"}>
                10000
              </Text>
            </Box>{" "}
            <Box
              background={useColorModeValue("#FCF6F9", "black")}
              border="1px solid gray"
              boxShadow="0px 1px 15px rgba(0, 0, 0, 0.06)"
              borderRadius="20px"
              padding="1rem"
              display={"flex"}
              justifyContent="space-between"
              alignItems="center"
              h="55px"
              w={{ base: "250px", sm: "450px" }}
              gap={"20px"}
              mb={{ base: 5 }}
              overflowY={"hidden"}
            >
              <Heading size="base">Total Income</Heading>
              <Text fontSize={"1rem"} fontWeight={"bold"}>
                10000
              </Text>
            </Box>
            <Flex justifyContent={"space-between"} mr={2} alignItems={"center"}>
              <Text fontWeight={"bold"}>Min</Text>
              <Text fontWeight={"bold"} fontSize={"2rem"}>
                Salary
              </Text>
              <Text fontWeight={"bold"}>Max</Text>
            </Flex>
            <Flex>
              <Box
                background={useColorModeValue("#FCF6F9", "black")}
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
                <Text size="md">10000</Text>
                <Text size={"md"}>10000</Text>
              </Box>
            </Flex>
            <Flex justifyContent={"space-between"} mr={2} alignItems={"center"}>
              <Text fontWeight={"bold"}>Min</Text>
              <Text fontWeight={"bold"} fontSize={"2rem"}>
                Expense
              </Text>
              <Text fontWeight={"bold"}>Max</Text>
            </Flex>
            <Flex>
              <Box
                background={useColorModeValue("#FCF6F9", "black")}
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
                <Text size="md">10000</Text>
                <Text size={"md"}>10000</Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </CustomBox>
    </Layout>
  );
};

export default Dashboard;
