"use client";
import Alert from "@/components/Alert";
import CustomBox from "@/components/CustomBox";
import Layout from "@/components/Layout";
import Pagination from "@/components/Pagination";
import { useShowCategory } from "@/hooks/useCategory";
import {
  useAddExpense,
  useDeleteExpense,
  useShowExpense,
} from "@/hooks/useExpense";
import dateFormat from "@/utils/dateFormat";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Select,
  Skeleton,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FiPlus, FiSearch, FiTrash } from "react-icons/fi";
import { useQueryClient } from "react-query";
import { BeatLoader } from "react-spinners";
import { date, number, object, string } from "yup";

const Expense = () => {
  const { data: session } = useSession();
  const id = session?.user?.id;
  const [currentPage, setCurrentPage] = useState(1);
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  // const [category, setCategory] = useState("");
  const [dateData, setDateData] = useState({
    startDate: "",
    endDate: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  // const [category, setCategory] = useState(searchParams.get("category") || "");
  // const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  // const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const category = searchParams.get("category") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const { data, isLoading } = useShowExpense(
    id || "",
    5,
    currentPage,
    startDate,
    endDate,
    category
  );
  const { data: categories } = useShowCategory(id || "");
  const {
    mutate,
    isSuccess,
    isLoading: expenseLoading,
  } = useAddExpense(onSuccess, onError);
  const { mutate: deleteExpense, isLoading: deleteLoading } = useDeleteExpense(
    onErrorDelete,
    onSuccessDelete
  );
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgCard = useColorModeValue("white", "dark");
  const inputOutlineColor = useColorModeValue("gray.400", "");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [expenseId, setExpenseId] = useState("");
  const initialValues = {
    title: "",
    amount: "",
    expenseDate: "",
    category: "",
  };
  const totalPages = Math.ceil(data?.data?.totalExpenses / 5);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const clickHandler = (values) => {
    const newData = {
      title: values.title,
      amount: values.amount,
      expenseDate: values.expenseDate,
      category: values.category,
      user: id,
    };
    mutate(newData);
  };

  function onSuccess(data) {
    queryClient.invalidateQueries(["show-expenses", id]);
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
    setExpenseId(id);
    onOpen();
  };

  const deleteHandler = () => {
    deleteExpense(expenseId);
  };

  function onSuccessDelete(data) {
    onClose();
    queryClient.invalidateQueries(["show-expenses", id]);
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

  const dateHandler = (e) => {
    setDateData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitDateHandler = () => {
    router.push(
      `?category=${category}&startDate=${dateData.startDate}&endDate=${dateData.endDate}`
    );
  };

  return (
    <Layout>
      <Alert
        isOpen={isOpen}
        onClose={onClose}
        onClick={deleteHandler}
        colorScheme={"red"}
        alertHeader={"Delete Expense"}
        alertBody={"Are you sure you want to delete this expense?"}
        confirmButtonText={"Yes"}
        isLoading={deleteLoading}
      />
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
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Skeleton
            isLoaded={!isLoading}
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
              Total Expense:
              <Text as={"span"} textColor={"green.400"}>
                {data?.data?.totalAmount}RS
              </Text>
            </Text>
          </Skeleton>
        </Box>
        <Flex
          flexDirection={{ base: "column", lg: "row" }}
          justifyContent={{ base: "center", lg: "normal" }}
          alignItems={{ base: "center", lg: "normal" }}
        >
          <Box w={{ base: "97%", md: "50%" }} my={"2"} p={"10px"}>
            <Formik
              initialValues={initialValues}
              onSubmit={async (values, { resetForm }) => {
                await clickHandler(values);
                if (isSuccess) resetForm();
              }}
              validationSchema={object({
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
                expenseDate: date().required("Date is required field!"),
                category: string().required("Category is required field!"),
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
                  <FormControl id="expense-title" mb="20px" isRequired>
                    <FormLabel>Expense Title</FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      placeholder="Expense Title"
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
                  <FormControl id="expense-amount" mb="20px" isRequired>
                    <FormLabel>Expense Amount</FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      placeholder="Expense Amount"
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
                    <FormLabel>Expense Date</FormLabel>
                    <Field
                      as={Input}
                      type="date"
                      placeholder="Expense Date"
                      outlineColor={inputOutlineColor}
                      name="expenseDate"
                      isInvalid={
                        Boolean(errors.expenseDate) &&
                        Boolean(touched.expenseDate)
                      }
                      onBlur={handleBlur}
                      onChange={handleChange("expenseDate")}
                      value={values.expenseDate || ""}
                    />
                    <FormHelperText color="red">
                      {Boolean(touched.expenseDate) && errors.expenseDate}
                    </FormHelperText>
                  </FormControl>
                  <FormControl id="category" mb="20px" isRequired>
                    <FormLabel mt={3}>Select Category</FormLabel>
                    <Select
                      placeholder="Select Category"
                      outlineColor={"gray"}
                      isInvalid={
                        Boolean(errors.category) && Boolean(touched.category)
                      }
                      onBlur={handleBlur}
                      onChange={handleChange("category")}
                      value={values.category || ""}
                    >
                      {categories?.data?.categories?.map((item) => (
                        <option key={item._id} value={item._id}>
                          <Box display="flex" alignItems="center">
                            <Text>{item.name}</Text>
                            <Image
                              src={item.icon} // Replace with the actual field name where the image URL is stored
                              alt={`icon-${item._id}`}
                              width={30}
                              height={30}
                              style={{ marginRight: "8px" }}
                            />
                          </Box>
                        </option>
                      ))}
                    </Select>
                    <FormHelperText color="red">
                      {Boolean(touched.category) && errors.category}
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
                    isLoading={expenseLoading}
                    spinner={<BeatLoader size={8} color="white" />}
                  >
                    Add Expense
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
          <Box w={{ base: "97%", md: "50%" }}>
            {isLoading &&
              [1, 2, 3, 4, 5].map((_data, index) => (
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
            <Container display={isLoading && "none"}>
              <Heading>Search By</Heading>
              <Flex
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <FormLabel my={3}>Select Category</FormLabel>
                <Select
                  value={category}
                  placeholder="Select Category"
                  onChange={(e) =>
                    router.push(
                      `?category=${e.target.value}&startDate=${startDate}&endDate=${endDate}`
                    )
                  }
                  outlineColor={"gray"}
                >
                  {categories?.data?.categories?.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex
                flexDirection={{ base: "column", sm: "row" }}
                justifyContent={"center"}
                alignItems={"center"}
                gap={2}
                flexWrap={"wrap"}
                my={3}
              >
                <FormControl>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    onChange={dateHandler}
                    value={dateData.startDate || startDate}
                    name="startDate"
                    outlineColor={"gray"}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    onChange={dateHandler}
                    value={dateData.endDate || endDate}
                    name="endDate"
                    outlineColor={"gray"}
                  />
                </FormControl>
                <Button
                  leftIcon={<FiSearch />}
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  _active={{ bg: "blue.400" }}
                  onClick={submitDateHandler}
                  mt={3}
                >
                  Search By Date
                </Button>
              </Flex>
            </Container>

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
                  No Expenses found
                </Text>
              </Box>
            )}
            {data?.data?.data?.map((item, index) => (
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
                    <Image
                      src={item?.category?.icon}
                      alt={`icon-${index}`}
                      width={40}
                      height={40}
                    />
                    <Text
                      fontFamily={"monospace"}
                      fontSize={{ base: "md", md: "xl" }}
                      fontWeight={"bold"}
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
                      {dateFormat(item.expenseDate)}
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
                data?.data?.totalExpenses <= 5 || isLoading ? "none" : "flex"
              }
            />
          </Box>
        </Flex>
      </CustomBox>
    </Layout>
  );
};

export default Expense;
