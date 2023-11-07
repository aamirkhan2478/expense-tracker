"use client";
import CustomBox from "@/components/CustomBox";
import Layout from "@/components/Layout";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiPlus, FiTrash } from "react-icons/fi";

const Expense = () => {
  const expenseItems = [
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
  const bgCard = useColorModeValue("white", "dark");
  return (
    <Layout>
      <CustomBox>
        <Heading p="4" fontFamily={"monospace"}>
          Expense
        </Heading>
        <Box
          ml="10px"
          mr={"10px"}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          textAlign={"center"}
          shadow={"lg"}
          bg={bgCard}
        >
          <Text
            fontFamily={"monospace"}
            fontSize={"3xl"}
            fontWeight={"bold"}
            p="20px"
          >
            Total Expense:
            <Text as={"span"} textColor={"green.400"}>
              10000RS
            </Text>
          </Text>
        </Box>
        <Flex flexDirection={{ base: "column", md: "row" }}>
          <Box w={{ base: "97%", md: "50%" }} my={"2"} p={"10px"}>
            <FormControl id="expense-title" mb="20px">
              <FormLabel>Expense Title</FormLabel>
              <Input
                type="text"
                placeholder="Expense Title"
                outlineColor={useColorModeValue("gray.400", "")}
              />
            </FormControl>
            <FormControl id="expense-amount" mb="20px">
              <FormLabel>Expense Amount</FormLabel>
              <Input
                type="text"
                placeholder="Expense Amount"
                outlineColor={useColorModeValue("gray.400", "")}
              />
            </FormControl>
            <FormControl id="date-picker" mb="20px">
              <FormLabel>Expense Date</FormLabel>
              <Input
                type="date"
                placeholder="Expense Date"
                outlineColor={useColorModeValue("gray.400", "")}
              />
            </FormControl>
            <Button
              leftIcon={<FiPlus />}
              bg={"blue.400"}
              color={"white"}
              _hover={{
                bg: "blue.500",
              }}
              _active={{ bg: "blue.400" }}
            >
              Add Expense
            </Button>
          </Box>
          <Box w={{ base: "97%", md: "50%" }}>
            {expenseItems.map((item) => (
              <Box
                key={item.title}
                borderWidth="1px"
                borderRadius={"10px"}
                bg={bgCard}
                m="10px"
                shadow={"lg"}
              >
                <Flex p="10px" flexDirection={{ base: "column", sm: "row" }}>
                  <Box w={"50%"}>
                    <Text
                      fontFamily={"monospace"}
                      fontSize={{ base: "md", md: "xl" }}
                      fontWeight={"bold"}
                      width={{ base: "200px", md: "220px" }}
                      mb={{ base: "5px", md: "0" }}
                    >
                    {item.title}
                    </Text>
                   
                  </Box>
                  <Box w={"50%"}>
                    <Text
                      fontFamily={"monospace"}
                      fontSize={{ base: "md", md: "xl" }}
                      fontWeight={"bold"}
                      mb={{ base: "5px", md: "0" }}
                    >
                      {item.amount}RS
                    </Text>
                    <Text
                      fontFamily={"monospace"}
                      fontSize={"md"}
                      mb={{ base: "5px", md: "0" }}
                    >
                      {item.date}
                    </Text>
                  </Box>
                  <Box w={"20%"}>
                    <IconButton
                      icon={<FiTrash color="red" />}
                      backgroundColor={"gray.200"}
                    />
                  </Box>
                </Flex>
              </Box>
            ))}
          </Box>
        </Flex>
      </CustomBox>
    </Layout>
  );
};

export default Expense;
