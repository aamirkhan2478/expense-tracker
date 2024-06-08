"use client";
import Alert from "@/components/Alert";
import CustomBox from "@/components/CustomBox";
import Dialog from "@/components/Dialog";
import Layout from "@/components/Layout";
import Pagination from "@/components/Pagination";
import { useShowCategory } from "@/hooks/useCategory";
import {
  useAddExpense,
  useAddManyExpense,
  useDeleteExpense,
  useShowExpense,
  useUpdateExpense,
} from "@/hooks/useExpense";
import dateFormat from "@/utils/dateFormat";
import {
  Box,
  Button,
  Container,
  Divider,
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
import { useRef, useState } from "react";
import { FiEdit, FiPlus, FiSearch, FiTrash } from "react-icons/fi";
import { MdDownload, MdImportExport } from "react-icons/md";
import { useQueryClient } from "react-query";
import { BeatLoader } from "react-spinners";
import { date, number, object, string } from "yup";
import Papa from "papaparse";

const Expense = () => {
  const { data: session } = useSession();
  const id = session?.user?.id;
  const [filterData, setFilterData] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const currentPage = searchParams.get("page") || 1;

  const { data, isLoading } = useShowExpense(
    id || "",
    5,
    currentPage,
    startDate,
    endDate,
    category
  );
  const { data: categories } = useShowCategory(id || "");
  const { mutate, isLoading: expenseLoading } = useAddExpense(
    onSuccess,
    onError
  );
  const { mutate: addManyExpense, isLoading: expenseManyLoading } =
    useAddManyExpense(onSuccess, onError);
  const { mutate: deleteExpense, isLoading: deleteLoading } = useDeleteExpense(
    onErrorDelete,
    onSuccessDelete
  );
  const { mutate: updateExpense, isLoading: updateLoading } = useUpdateExpense(
    onSuccess,
    onError
  );
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgCard = useColorModeValue("white", "dark");
  const inputOutlineColor = useColorModeValue("gray.400", "");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDialog,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure();

  const [expenseId, setExpenseId] = useState("");
  const expense = data?.data?.data?.find((item) => item._id === expenseId);

  const initialValues = {
    title: expense?.title || "",
    amount: expense?.amount || "",
    expenseDate: dateFormat(expense?.expenseDate, "YYYY-MM-DD") || "",
    category: expense?.category?._id || "",
  };
  const totalPages = Math.ceil(data?.data?.totalExpenses / 5);
  const handlePageChange = (page) => {
    router.push(
      `?category=${filterData.category}&startDate=${filterData.startDate}&endDate=${filterData.endDate}&page=${page}`
    );
  };
  const clickHandler = (values, { resetForm }) => {
    const newData = {
      title: values.title,
      amount: values.amount,
      expenseDate: values.expenseDate,
      category: values.category,
      user: id,
    };
    mutate(newData, {
      onSuccess: () => {
        resetForm();
      },
    });
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

  const confirmUpdateDialog = (id) => {
    setExpenseId(id);
    onOpenDialog();
  };

  const updateHandler = (values) => {
    const newData = {
      id: expenseId,
      title: values.title,
      amount: values.amount,
      expenseDate: values.expenseDate,
      category: values.category,
    };

    updateExpense(newData, {
      onSuccess: () => {
        onCloseDialog();
      },
    });
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

  const changeHandler = (e) => {
    setFilterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitHandler = () => {
    router.push(
      `?category=${filterData.category}&startDate=${filterData.startDate}&endDate=${filterData.endDate}&page=${currentPage}`
    );
  };

  const fileRef = useRef(null);

  const acceptableCSVFileTypes =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .csv";

  const fileHandler = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data.map((item) => {
          // validate data
          if (
            !item.title ||
            !item.amount ||
            !item.expenseDate ||
            !item.category
          ) {
            toast({
              title: "Invalid data",
              status: "error",
              isClosable: true,
            });
          }

          let category = categories?.data?.categories?.find(
            (category) => category.name === item.category
          );

          if (!category) {
            toast({
              title: `Category ${item.category} not found!`,
              status: "error",
              isClosable: true,
            });
            return;
          }

          if (category?._id === undefined) {
            toast({
              title: "Invalid category",
              status: "error",
              isClosable: true,
            });
            return;
          }

          return {
            title: item.title,
            amount: item.amount,
            expenseDate: new Date(item.expenseDate).toISOString(),
            category: category?._id,
            user: id,
          };
        });

        addManyExpense(data, {
          onSuccess: (data) => {
            toast({
              title: data?.data?.msg,
              status: "success",
              isClosable: true,
            });
          },
        });
      },
    });
  };

  const downloadSample = () => {
    const csv = Papa.unparse([
      {
        title: "Title",
        amount: "100",
        expenseDate: "2022-12-31",
        category: "Category Name",
      },
    ]);

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <Dialog
        title={"Update Expense"}
        isOpen={isOpenDialog}
        onClose={onCloseDialog}
        body={
          <Box>
            <Formik
              initialValues={initialValues}
              onSubmit={updateHandler}
              validationSchema={object({
                title: string()
                  .matches(
                    /^(?=.{3,50}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
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
                  <Divider my={2} />
                  <Box display={"flex"} gap={2}>
                    <Button onClick={onCloseDialog} colorScheme="red">
                      Cancel
                    </Button>
                    <Button
                      leftIcon={<FiEdit />}
                      bg={"blue.400"}
                      color={"white"}
                      _hover={{
                        bg: "blue.500",
                      }}
                      _active={{ bg: "blue.400" }}
                      isDisabled={!isValid || !dirty}
                      type="submit"
                      onClick={handleSubmit}
                      isLoading={updateLoading}
                      spinner={<BeatLoader size={8} color="white" />}
                    >
                      Update Expense
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        }
      />
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
              onSubmit={clickHandler}
              validationSchema={object({
                title: string()
                  .matches(
                    /^(?=.{3,50}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z0-9 ]+(?<![_.])$/,
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
                  defaultValue={filterData.category || category}
                  value={filterData.category || category}
                  placeholder="Select Category"
                  onChange={changeHandler}
                  outlineColor={"gray"}
                  name="category"
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
                    onChange={changeHandler}
                    defaultValue={filterData.startDate || startDate}
                    value={filterData.startDate || startDate}
                    name="startDate"
                    outlineColor={"gray"}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    onChange={changeHandler}
                    defaultValue={filterData.endDate || endDate}
                    value={filterData.endDate || endDate}
                    name="endDate"
                    outlineColor={"gray"}
                  />
                </FormControl>
                <Flex gap={2} flexDirection={"column"}>
                  <Button
                    leftIcon={<FiSearch />}
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
                    }}
                    _active={{ bg: "blue.400" }}
                    onClick={submitHandler}
                    mt={3}
                  >
                    Search
                  </Button>
                  <Button
                    leftIcon={<MdImportExport />}
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
                    }}
                    _active={{ bg: "blue.400" }}
                    onClick={() => {
                      fileRef.current.click();
                    }}
                    mt={3}
                  >
                    Import
                  </Button>
                  <Button
                    leftIcon={<MdDownload />}
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
                    }}
                    _active={{ bg: "blue.400" }}
                    onClick={downloadSample}
                    mt={3}
                  >
                    Download Sample
                  </Button>
                  <input
                    type="file"
                    hidden
                    ref={fileRef}
                    accept={acceptableCSVFileTypes}
                    onChange={fileHandler}
                  />
                </Flex>
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
                  <Box
                    w={"20%"}
                    display={"flex"}
                    gap={2}
                    flexDirection={"column"}
                  >
                    <IconButton
                      icon={<FiTrash color="red" />}
                      backgroundColor={"gray.200"}
                      onClick={() => confirmDialog(item._id)}
                    />
                    <IconButton
                      icon={<FiEdit color="blue" />}
                      backgroundColor={"gray.200"}
                      onClick={() => confirmUpdateDialog(item._id)}
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
