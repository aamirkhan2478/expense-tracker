"use client";
import Alert from "@/components/Alert";
import CustomBox from "@/components/CustomBox";
import Layout from "@/components/Layout";
import Pagination from "@/components/Pagination";
import {
  useAddIncome,
  useDeleteIncome,
  useShowIncome,
} from "@/hooks/useIncome";
import { calculateIncome } from "@/logic/calculations";
import dateFormat from "@/utils/dateFormat";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Skeleton,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { useQueryClient } from "react-query";
import { BeatLoader } from "react-spinners";
import { date, number, object, string } from "yup";

const Income = () => {
  const { data: session } = useSession();
  const id = session?.user?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const [incomeDate, setIncomeDate] = useState("");
  const { data, isFetching } = useShowIncome(id, 5, currentPage, incomeDate);
  const { mutate, isSuccess, isLoading } = useAddIncome(onSuccess, onError);
  const { mutate: deleteIncome, isLoading: deleteLoading } = useDeleteIncome(
    onErrorDelete,
    onSuccessDelete
  );
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgCard = useColorModeValue("white", "dark");
  const inputOutlineColor = useColorModeValue("gray.400", "");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [incomeId, setIncomeId] = useState("");
  const initialValues = {
    companyName: "",
    title: "",
    amount: "",
    incomeDate: "",
  };
  const totalPages = Math.ceil(data?.data?.totalIncomes / 5);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const clickHandler = (values) => {
    const newData = {
      companyName: values.companyName,
      title: values.title,
      amount: values.amount,
      incomeDate: values.incomeDate,
      user: id,
    };
    mutate(newData);
  };

  function onSuccess(data) {
    queryClient.invalidateQueries(["show-incomes", id]);
    toast({
      title: data?.data?.msg,
      status: "success",
      isClosable: true,
    });
  }

  function onError(error) {
    toast({
      title: error.response.data.error,
      status: "error",
      isClosable: true,
    });
  }

  const confirmDialog = (id) => {
    setIncomeId(id);
    onOpen();
  };

  const deleteHandler = () => {
    deleteIncome(incomeId);
  };

  function onSuccessDelete(data) {
    onClose();
    queryClient.invalidateQueries(["show-incomes", id]);
    toast({
      title: data?.data?.msg,
      status: "success",
      isClosable: true,
    });
  }

  function onErrorDelete(error) {
    toast({
      title: error.response.data.error,
      status: "error",
      isClosable: true,
    });
  }
  return (
    <Layout>
      <Alert
        isOpen={isOpen}
        onClose={onClose}
        onClick={deleteHandler}
        colorScheme={"red"}
        alertHeader={"Delete Income"}
        alertBody={"Are you sure you want to delete this income?"}
        confirmButtonText={"Yes"}
        isLoading={deleteLoading}
      />
      <CustomBox>
        <Heading p="4" fontFamily={"monospace"}>
          Income
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
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Skeleton
            isLoaded={!isFetching}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            overflow="hidden"
            borderRadius={10}
          >
            <Text
              fontFamily={"monospace"}
              fontSize={{ base: "xl", sm: "1xl", md: "3xl" }}
              fontWeight={"bold"}
              textAlign={"center"}
              overflow="hidden"
            >
              Total Income:
              <Text as={"span"} textColor={"green.400"}>
                {!incomeDate
                  ? data?.data?.totalAmount
                  : calculateIncome(data?.data?.data)}
                RS
              </Text>
            </Text>
          </Skeleton>
        </Box>
        <Flex flexDirection={{ base: "column", md: "row" }}>
          <Box w={{ base: "97%", md: "50%" }} my={"2"} p={"10px"}>
            <Formik
              initialValues={initialValues}
              onSubmit={async (values, { resetForm }) => {
                await clickHandler(values);
                if (isSuccess) resetForm();
              }}
              validationSchema={object({
                companyName: string()
                  .matches(
                    /^(?=.{3,30}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
                    "Company Name should have at least 3 characters, should not any number and start with capital letter!"
                  )
                  .required("Title is required field!"),
                title: string()
                  .matches(
                    /^(?=.{3,20}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
                    "Title should have at least 3 characters, should not any number and start with capital letter!"
                  )
                  .required("Title is required field!"),
                amount: number("Amount must be a number!")
                  .typeError("That doesn't look like a number")
                  .positive("Amount must be a positive number!")
                  .required("Amount is required field!")
                  .integer("Please enter only integers!"),
                incomeDate: date().required("Date is required field!"),
              })}
            >
              {({
                errors,
                values,
                dirty,
                isValid,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
              }) => (
                <Form>
                  <FormControl id="income-title" mb="20px" isRequired>
                    <FormLabel>Income Company Name</FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      placeholder="Income Company Name"
                      outlineColor={inputOutlineColor}
                      name="companyName"
                      isInvalid={
                        Boolean(errors.companyName) &&
                        Boolean(touched.companyName)
                      }
                      onBlur={handleBlur}
                      onChange={handleChange("companyName")}
                      value={values.companyName || ""}
                    />
                    <FormHelperText color="red">
                      {Boolean(touched.companyName) && errors.companyName}
                    </FormHelperText>
                  </FormControl>
                  <FormControl id="income-title" mb="20px" isRequired>
                    <FormLabel>Income Title</FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      placeholder="Income Title"
                      outlineColor={inputOutlineColor}
                      name="title"
                      isInvalid={
                        Boolean(errors.title) && Boolean(touched.title)
                      }
                      onBlur={handleBlur}
                      onChange={handleChange("title")}
                      value={values.title || ""}
                    />
                    <FormHelperText color="red">
                      {Boolean(touched.title) && errors.title}
                    </FormHelperText>
                  </FormControl>
                  <FormControl id="income-amount" mb="20px" isRequired>
                    <FormLabel>Income Amount</FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      placeholder="Income Amount"
                      outlineColor={inputOutlineColor}
                      name="amount"
                      isInvalid={
                        Boolean(errors.amount) && Boolean(touched.amount)
                      }
                      onBlur={handleBlur}
                      onChange={handleChange("amount")}
                      value={values.amount || ""}
                    />
                    <FormHelperText color="red">
                      {Boolean(touched.amount) && errors.amount}
                    </FormHelperText>
                  </FormControl>
                  <FormControl id="date-picker" mb="20px" isRequired>
                    <FormLabel>Income Date</FormLabel>
                    <Field
                      as={Input}
                      type="date"
                      placeholder="Income Date"
                      outlineColor={inputOutlineColor}
                      name="incomeDate"
                      isInvalid={
                        Boolean(errors.incomeDate) &&
                        Boolean(touched.incomeDate)
                      }
                      onBlur={handleBlur}
                      onChange={handleChange("incomeDate")}
                      value={values.incomeDate || ""}
                    />
                    <FormHelperText color="red">
                      {Boolean(touched.incomeDate) && errors.incomeDate}
                    </FormHelperText>
                  </FormControl>
                  <Button
                    leftIcon={<FiPlus />}
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
                    }}
                    _active={{ bg: "blue.400" }}
                    isDisabled={!isValid || !dirty}
                    type="submit"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    spinner={<BeatLoader size={8} color="white" />}
                  >
                    Add Income
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
          <Box w={{ base: "97%", md: "50%" }}>
            {isFetching &&
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_data, index) => (
                <Skeleton
                  key={index}
                  borderWidth="1px"
                  borderRadius={"10px"}
                  m="10px"
                >
                  <Box
                    borderWidth="1px"
                    borderRadius={"10px"}
                    bg={bgCard}
                    m="10px"
                    shadow={"lg"}
                  >
                    <Flex
                      p="10px"
                      flexDirection={{ base: "column", sm: "row" }}
                    >
                      <Box w={"50%"}>
                        <Text
                          fontFamily={"monospace"}
                          fontSize={{ base: "md", md: "xl" }}
                          fontWeight={"bold"}
                          width={{ base: "200px", md: "220px" }}
                          mb={{ base: "5px", md: "0" }}
                        ></Text>
                      </Box>
                      <Box w={"50%"}>
                        <Text
                          fontFamily={"monospace"}
                          fontSize={{ base: "md", md: "xl" }}
                          fontWeight={"bold"}
                          mb={{ base: "5px", md: "0" }}
                        ></Text>
                        <Text
                          fontFamily={"monospace"}
                          fontSize={"md"}
                          mb={{ base: "5px", md: "0" }}
                        ></Text>
                      </Box>
                      <Box w={"20%"}>
                        <IconButton
                          icon={<FiTrash color="red" />}
                          backgroundColor={"gray.200"}
                        />
                      </Box>
                    </Flex>
                  </Box>
                </Skeleton>
              ))}
            <Flex
              justifyContent={"center"}
              display={isFetching ? "none" : "flex"}
            >
              <Input
                type="date"
                onChange={(e) => setIncomeDate(e.target.value)}
                mt={5}
                outlineColor={"gray"}
                width={{ base: 200, sm: 300 }}
              />
            </Flex>
            {data?.data?.data?.length === 0 && (
              <Box
                borderWidth="1px"
                borderRadius={"10px"}
                bg={bgCard}
                m="10px"
                shadow={"lg"}
                p={10}
              >
                <Text
                  fontFamily={"monospace"}
                  fontSize={{ base: "md", md: "xl" }}
                  fontWeight={"bold"}
                  width={{ base: "200px", md: "220px" }}
                  mb={{ base: "5px", md: "0" }}
                  color={"red.400"}
                >
                  No Incomes found
                </Text>
              </Box>
            )}

            {data?.data?.data?.map((item) => (
              <Box
                key={item._id}
                borderWidth="1px"
                borderRadius={"10px"}
                bg={bgCard}
                m="10px"
                shadow={"lg"}
              >
                <Flex p="10px">
                  <Box w={"50%"}>
                    <Text
                      fontFamily={"monospace"}
                      fontSize={{ base: "md", md: "xl" }}
                      fontWeight={"bold"}
                      w={{ base: "60px", sm: "500px" }}
                      mb={{ base: "5px", md: "0" }}
                    >
                      {item.companyName}
                    </Text>
                    <Text
                      fontFamily={"monospace"}
                      fontSize={{ base: "xs", md: "md" }}
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
                      {dateFormat(item.incomeDate)}
                    </Text>
                  </Box>
                  <Box w={"20%"}>
                    <IconButton
                      icon={<FiTrash color="red" />}
                      backgroundColor={"gray.200"}
                      onClick={() => confirmDialog(item._id)}
                    />
                  </Box>
                </Flex>
              </Box>
            ))}
            <Pagination
              currentPage={currentPage}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              display={
                data?.data?.totalIncomes <= 5 || isFetching ? "none" : "flex"
              }
            />
          </Box>
        </Flex>
      </CustomBox>
    </Layout>
  );
};

export default Income;
