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
import { useSettings, formatMoney } from "@/hooks/useSettings";
import dateFormat from "@/utils/dateFormat";
import { exportToCSV, exportToJSON, formatExpenseForExport } from "@/utils/exportData";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  Badge,
  Switch,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, Suspense, useEffect } from "react";
import { useHighlight } from "@/hooks/useHighlight";
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiCalendar,
  FiDollarSign,
  FiTag,
  FiFilter,
  FiTrendingDown,
  FiDownload,
  FiUpload,
  FiFileText,
} from "react-icons/fi";
import { useQueryClient } from "react-query";
import { BeatLoader } from "react-spinners";
import { date, number, object, string } from "yup";
import Papa from "papaparse";

const MotionBox = motion(Box);

const ExpenseContent = () => {
  let id = "";
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("user"));
    id = user?.id || "";
  }

  const { settings } = useSettings();
  const [filterData, setFilterData] = useState({
    category: "",
    startDate: "",
    endDate: "",
    searchQuery: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const currentPage = searchParams.get("page") || 1;
  const searchQuery = searchParams.get("searchQuery") || "";

  const { data, isLoading } = useShowExpense(
    id || "",
    5,
    currentPage,
    startDate,
    endDate,
    category,
    searchQuery,
  );
  const { data: categories } = useShowCategory(id || "");
  const { mutate, isLoading: expenseLoading } = useAddExpense(
    onSuccess,
    onError,
  );
  const { mutate: addManyExpense, isLoading: expenseManyLoading } =
    useAddManyExpense(onSuccess, onError);
  const { mutate: deleteExpense, isLoading: deleteLoading } = useDeleteExpense(
    onErrorDelete,
    onSuccessDelete,
  );
  const { mutate: updateExpense, isLoading: updateLoading } = useUpdateExpense(
    onSuccess,
    onError,
  );
  const toast = useToast();
  const queryClient = useQueryClient();
  const { highlightId, setHighlightId } = useHighlight();
  const [pendingHighlight, setPendingHighlight] = useState(null);

  // On mount: read page & highlight params
  useEffect(() => {
    const highlightParam = searchParams.get("highlight");
    if (highlightParam) {
      setPendingHighlight(highlightParam);
      setHighlightId(highlightParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When data loads, check if highlighted record is visible.
  // If filters hide it, clear them.
  useEffect(() => {
    if (!pendingHighlight || !data?.data?.data) return;

    const found = data.data.data.some((item) => item._id === pendingHighlight);
    if (found) {
      setTimeout(() => {
        const el = document.getElementById(`record-${pendingHighlight}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      setPendingHighlight(null);
    } else if (category || startDate || endDate || searchQuery) {
      // Hidden by filters — clear them and go to page 1
      router.push("?page=1&highlight=" + pendingHighlight);
      // Keep pendingHighlight so we retry after navigation
    } else {
      setPendingHighlight(null);
    }
  }, [pendingHighlight, data, category, startDate, endDate, searchQuery, router]);

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

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
    isRecurring: expense?.isRecurring || false,
    recurringFrequency: expense?.recurringFrequency || "monthly",
  };
  const totalPages = Math.ceil(data?.data?.totalExpenses / 5);
  const handlePageChange = (page) => {
    router.push(
      `?category=${filterData.category}&startDate=${filterData.startDate}&endDate=${filterData.endDate}&page=${page}&searchQuery=${filterData.searchQuery}`,
    );
  };
  const clickHandler = (values, { resetForm }) => {
    const newData = {
      title: values.title,
      amount: values.amount,
      expenseDate: values.expenseDate,
      category: values.category,
      user: id,
      isRecurring: values.isRecurring,
      recurringFrequency: values.isRecurring ? values.recurringFrequency : null,
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
      title: error.response?.data?.error || "Something went wrong",
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
      isRecurring: values.isRecurring,
      recurringFrequency: values.isRecurring ? values.recurringFrequency : null,
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
      title: error.response?.data?.error || "Delete failed",
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

  const filterHandler = () => {
    const newFilterData = { ...filterData, page: 1 };
    router.push(
      `?category=${newFilterData.category}&startDate=${newFilterData.startDate}&endDate=${newFilterData.endDate}&page=${newFilterData.page}&searchQuery=${newFilterData.searchQuery}`,
    );
    setFilterData(newFilterData);
  };

  const fileRef = useRef(null);
  const acceptableCSVFileTypes = ".csv";

  const fileHandler = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data.map((item) => {
          if (!item.title || !item.amount || !item.expenseDate || !item.category) {
            toast({ title: "Invalid data", status: "error", isClosable: true });
          }
          let cat = categories?.data?.categories?.find(
            (category) => category.name === item.category,
          );
          if (!cat) {
            toast({ title: `Category ${item.category} not found!`, status: "error", isClosable: true });
            return;
          }
          if (cat?._id === undefined) {
            toast({ title: "Invalid category", status: "error", isClosable: true });
            return;
          }
          return {
            title: item.title,
            amount: item.amount,
            expenseDate: new Date(item.expenseDate).toISOString(),
            category: cat?._id,
            user: id,
          };
        });

        addManyExpense(data, {
          onSuccess: (data) => {
            toast({ title: data?.data?.msg, status: "success", isClosable: true });
          },
        });
      },
    });
  };

  const downloadSample = () => {
    const csv = Papa.unparse([
      { title: "Title", amount: "100", expenseDate: "2022-12-31", category: "Category Name" },
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
                    "Title should have at least 3 characters, should not any number and start with capital letter!",
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
                  <Stack spacing={4}>
                    <FormControl isInvalid={Boolean(errors.title) && Boolean(touched.title)}>
                      <FormLabel fontSize="sm" fontWeight="medium">Expense Title</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none"><Icon as={FiTag} color="gray.400" /></InputLeftElement>
                        <Field
                          as={Input}
                          type="text"
                          placeholder="Expense Title"
                          name="title"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          pl={10}
                          isInvalid={Boolean(errors.title) && Boolean(touched.title)}
                          onBlur={handleBlur}
                          onChange={handleChange("title")}
                          value={values.title || ""}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.title}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={Boolean(errors.amount) && Boolean(touched.amount)}>
                      <FormLabel fontSize="sm" fontWeight="medium">Amount</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none"><Icon as={FiDollarSign} color="gray.400" /></InputLeftElement>
                        <Field
                          as={Input}
                          type="text"
                          placeholder="Amount"
                          name="amount"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          pl={10}
                          isInvalid={Boolean(errors.amount) && Boolean(touched.amount)}
                          onBlur={handleBlur}
                          onChange={handleChange("amount")}
                          value={values.amount || ""}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.amount}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={Boolean(errors.expenseDate) && Boolean(touched.expenseDate)}>
                      <FormLabel fontSize="sm" fontWeight="medium">Date</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none"><Icon as={FiCalendar} color="gray.400" /></InputLeftElement>
                        <Field
                          as={Input}
                          type="date"
                          name="expenseDate"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          pl={10}
                          isInvalid={Boolean(errors.expenseDate) && Boolean(touched.expenseDate)}
                          onBlur={handleBlur}
                          onChange={handleChange("expenseDate")}
                          value={values.expenseDate || ""}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.expenseDate}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={Boolean(errors.category) && Boolean(touched.category)}>
                      <FormLabel fontSize="sm" fontWeight="medium">Category</FormLabel>
                      <Select
                        placeholder="Select Category"
                        borderRadius="xl"
                        focusBorderColor="teal.400"
                        isInvalid={Boolean(errors.category) && Boolean(touched.category)}
                        onBlur={handleBlur}
                        onChange={handleChange("category")}
                        value={values.category || ""}
                      >
                        {categories?.data?.categories?.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.category}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <Flex align="center" gap={3}>
                        <Field
                          as={Switch}
                          name="isRecurring"
                          colorScheme="red"
                          isChecked={values.isRecurring}
                          onChange={handleChange("isRecurring")}
                        />
                        <FormLabel htmlFor="isRecurring" mb={0} fontSize="sm" fontWeight="medium">
                          Recurring Expense
                        </FormLabel>
                      </Flex>
                    </FormControl>

                    {values.isRecurring && (
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="medium">Frequency</FormLabel>
                        <Field
                          as={Select}
                          name="recurringFrequency"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          onChange={handleChange("recurringFrequency")}
                          value={values.recurringFrequency || "monthly"}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </Field>
                      </FormControl>
                    )}

                    <Flex gap={3} pt={2}>
                      <Button onClick={onCloseDialog} variant="ghost" flex={1} borderRadius="xl">
                        Cancel
                      </Button>
                      <Button
                        leftIcon={<FiEdit2 />}
                        bg="teal.500"
                        color="white"
                        _hover={{ bg: "teal.400" }}
                        _active={{ bg: "teal.600" }}
                        isDisabled={!isValid || !dirty}
                        type="submit"
                        onClick={handleSubmit}
                        isLoading={updateLoading}
                        spinner={<BeatLoader size={8} color="white" />}
                        flex={1}
                        borderRadius="xl"
                      >
                        Update
                      </Button>
                    </Flex>
                  </Stack>
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
        alertBody={"Are you sure you want to delete this expense? This action cannot be undone."}
        confirmButtonText={"Delete"}
        isLoading={deleteLoading}
      />

      <CustomBox>
        <Stack spacing={8}>
          {/* Header */}
          <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
            <Box>
              <Heading size="lg" fontWeight="bold" mb={1}>
                Expenses
              </Heading>
              <Text fontSize="sm" color={mutedText}>
                Manage and track your spending
              </Text>
            </Box>
            <Flex align="center" gap={2}>
              <IconButton
                icon={<FiDownload />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                borderRadius="full"
                aria-label="Export CSV"
                onClick={() => {
                  const rows = formatExpenseForExport(data?.data?.data || [], settings.currency);
                  exportToCSV(rows, `expenses_${new Date().toISOString().split("T")[0]}`);
                }}
                title="Export CSV"
              />
              <IconButton
                icon={<FiFileText />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                borderRadius="full"
                aria-label="Export JSON"
                onClick={() => {
                  exportToJSON(data?.data?.data || [], `expenses_${new Date().toISOString().split("T")[0]}`);
                }}
                title="Export JSON"
              />
              <Badge
                colorScheme="red"
                variant="subtle"
                px={4}
                py={2}
                borderRadius="xl"
                fontSize="md"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiTrendingDown} />
                <Skeleton isLoaded={!isLoading}>
                  <Text fontWeight="bold">{formatMoney(data?.data?.totalAmount || 0, settings)}</Text>
                </Skeleton>
              </Badge>
            </Flex>
          </Flex>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 6, md: 8 }}>
            {/* Form */}
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                bg={bgCard}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                p={6}
                boxShadow="sm"
              >
                <Text fontSize="lg" fontWeight="bold" mb={5}>
                  Add New Expense
                </Text>
                <Formik
                  initialValues={{ title: "", amount: "", expenseDate: "", category: "", isRecurring: false, recurringFrequency: "monthly" }}
                  onSubmit={clickHandler}
                  validationSchema={object({
                    title: string()
                      .matches(
                        /^(?=.{3,50}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
                        "Title should have at least 3 characters, should not any number and start with capital letter!",
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
                      <Stack spacing={4}>
                        <FormControl isInvalid={Boolean(errors.title) && Boolean(touched.title)}>
                          <FormLabel fontSize="sm" fontWeight="medium">Title</FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none"><Icon as={FiTag} color="gray.400" /></InputLeftElement>
                            <Field
                              as={Input}
                              type="text"
                              placeholder="Expense Title"
                              name="title"
                              borderRadius="xl"
                              focusBorderColor="teal.400"
                              pl={10}
                              isInvalid={Boolean(errors.title) && Boolean(touched.title)}
                              onBlur={handleBlur}
                              onChange={handleChange("title")}
                              value={values.title || ""}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.title}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={Boolean(errors.amount) && Boolean(touched.amount)}>
                          <FormLabel fontSize="sm" fontWeight="medium">Amount</FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none"><Icon as={FiDollarSign} color="gray.400" /></InputLeftElement>
                            <Field
                              as={Input}
                              type="text"
                              placeholder="Amount"
                              name="amount"
                              borderRadius="xl"
                              focusBorderColor="teal.400"
                              pl={10}
                              isInvalid={Boolean(errors.amount) && Boolean(touched.amount)}
                              onBlur={handleBlur}
                              onChange={handleChange("amount")}
                              value={values.amount || ""}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.amount}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={Boolean(errors.expenseDate) && Boolean(touched.expenseDate)}>
                          <FormLabel fontSize="sm" fontWeight="medium">Date</FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none"><Icon as={FiCalendar} color="gray.400" /></InputLeftElement>
                            <Field
                              as={Input}
                              type="date"
                              name="expenseDate"
                              borderRadius="xl"
                              focusBorderColor="teal.400"
                              pl={10}
                              isInvalid={Boolean(errors.expenseDate) && Boolean(touched.expenseDate)}
                              onBlur={handleBlur}
                              onChange={handleChange("expenseDate")}
                              value={values.expenseDate || ""}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.expenseDate}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={Boolean(errors.category) && Boolean(touched.category)}>
                          <FormLabel fontSize="sm" fontWeight="medium">Category</FormLabel>
                          <Select
                            placeholder="Select Category"
                            borderRadius="xl"
                            focusBorderColor="teal.400"
                            isInvalid={Boolean(errors.category) && Boolean(touched.category)}
                            onBlur={handleBlur}
                            onChange={handleChange("category")}
                            value={values.category || ""}
                          >
                            {categories?.data?.categories?.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.name}
                              </option>
                            ))}
                          </Select>
                          <FormErrorMessage>{errors.category}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <Flex align="center" gap={3}>
                            <Field
                              as={Switch}
                              name="isRecurring"
                              colorScheme="red"
                              isChecked={values.isRecurring}
                              onChange={handleChange("isRecurring")}
                            />
                            <FormLabel htmlFor="isRecurring" mb={0} fontSize="sm" fontWeight="medium">
                              Recurring Expense
                            </FormLabel>
                          </Flex>
                        </FormControl>

                        {values.isRecurring && (
                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="medium">Frequency</FormLabel>
                            <Field
                              as={Select}
                              name="recurringFrequency"
                              borderRadius="xl"
                              focusBorderColor="teal.400"
                              onChange={handleChange("recurringFrequency")}
                              value={values.recurringFrequency || "monthly"}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </Field>
                          </FormControl>
                        )}

                        <Button
                          leftIcon={<FiPlus />}
                          size="lg"
                          bg="teal.500"
                          color="white"
                          _hover={{ bg: "teal.400", transform: "translateY(-1px)" }}
                          _active={{ bg: "teal.600" }}
                          isDisabled={!isValid || !dirty}
                          type="submit"
                          onClick={handleSubmit}
                          isLoading={expenseLoading}
                          spinner={<BeatLoader size={8} color="white" />}
                          borderRadius="xl"
                          boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
                        >
                          Add Expense
                        </Button>
                      </Stack>
                    </Form>
                  )}
                </Formik>
              </MotionBox>
            </GridItem>

            {/* List + Filters */}
            <GridItem>
              <Stack spacing={4}>
                {/* Filters */}
                <Box
                  bg={bgCard}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  p={5}
                  boxShadow="sm"
                >
                  <Flex align="center" gap={2} mb={4}>
                    <Icon as={FiFilter} color="teal.500" />
                    <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                      Filters
                    </Text>
                  </Flex>
                  <Stack spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">Category</FormLabel>
                      <Select
                        placeholder="All Categories"
                        borderRadius="xl"
                        focusBorderColor="teal.400"
                        name="category"
                        value={filterData.category}
                        onChange={changeHandler}
                      >
                        {categories?.data?.categories?.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <Flex gap={3}>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="medium">Start Date</FormLabel>
                        <Input
                          type="date"
                          name="startDate"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          value={filterData.startDate || startDate}
                          onChange={changeHandler}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="medium">End Date</FormLabel>
                        <Input
                          type="date"
                          name="endDate"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          value={filterData.endDate || endDate}
                          onChange={changeHandler}
                        />
                      </FormControl>
                    </Flex>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">Search by Title</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
                        <Input
                          type="text"
                          name="searchQuery"
                          placeholder="Search..."
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          pl={10}
                          value={filterData.searchQuery}
                          onChange={changeHandler}
                        />
                      </InputGroup>
                    </FormControl>
                    <Flex gap={2} wrap="wrap">
                      <Button
                        leftIcon={<FiSearch />}
                        bg="teal.500"
                        color="white"
                        _hover={{ bg: "teal.400" }}
                        size="sm"
                        borderRadius="xl"
                        onClick={filterHandler}
                        flex={1}
                      >
                        Search
                      </Button>
                      <Button
                        leftIcon={<FiUpload />}
                        variant="outline"
                        colorScheme="teal"
                        size="sm"
                        borderRadius="xl"
                        onClick={() => fileRef.current.click()}
                        isLoading={expenseManyLoading}
                      >
                        Import
                      </Button>
                      <Button
                        leftIcon={<FiDownload />}
                        variant="ghost"
                        colorScheme="teal"
                        size="sm"
                        borderRadius="xl"
                        onClick={downloadSample}
                      >
                        Sample
                      </Button>
                      <input
                        type="file"
                        hidden
                        ref={fileRef}
                        accept={acceptableCSVFileTypes}
                        onChange={fileHandler}
                      />
                    </Flex>
                  </Stack>
                </Box>

                {/* List */}
                <Text fontSize="lg" fontWeight="bold">
                  Recent Expenses
                </Text>

                {isLoading &&
                  [1, 2, 3].map((i) => (
                    <Skeleton key={i} height="80px" borderRadius="xl" />
                  ))}

                {!isLoading && data?.data?.data?.length === 0 && (
                  <Box
                    p={8}
                    textAlign="center"
                    borderRadius="2xl"
                    border="1px dashed"
                    borderColor={borderColor}
                  >
                    <Icon as={FiTrendingDown} boxSize={8} color="gray.300" mb={3} />
                    <Text fontWeight="medium" color={mutedText}>
                      No expenses found
                    </Text>
                    <Text fontSize="sm" color={mutedText}>
                      Add your first expense to get started
                    </Text>
                  </Box>
                )}

                {!isLoading &&
                  data?.data?.data?.map((item) => {
                    const isHighlighted = highlightId === item._id;
                    return (
                    <MotionBox
                      key={item._id}
                      id={`record-${item._id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      bg={isHighlighted ? "red.50" : bgCard}
                      border="2px solid"
                      borderColor={isHighlighted ? "red.400" : borderColor}
                      borderRadius="xl"
                      p={4}
                      boxShadow={isHighlighted ? "0 0 0 4px rgba(244, 63, 94, 0.2)" : "sm"}
                      _hover={{ boxShadow: "md", borderColor: "red.200" }}
                      transition={{ duration: 0.2 }}
                    >
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap={3}>
                          <Flex
                            w={10}
                            h={10}
                            borderRadius="xl"
                            bg="red.50"
                            align="center"
                            justify="center"
                            overflow="hidden"
                          >
                            {item?.category?.icon ? (
                              <Image
                                src={item.category.icon}
                                alt={item.category.name}
                                width={24}
                                height={24}
                              />
                            ) : (
                              <Icon as={FiTrendingDown} color="red.500" />
                            )}
                          </Flex>
                          <Stack spacing={0}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {item.title}
                            </Text>
                            <Text fontSize="xs" color={mutedText}>
                              {item.category?.name || "Uncategorized"}
                            </Text>
                            {item.isRecurring && (
                              <Badge colorScheme="red" variant="subtle" fontSize="10px" borderRadius="full" w="fit-content">
                                Recurring · {item.recurringFrequency}
                              </Badge>
                            )}
                          </Stack>
                        </Flex>
                        <Stack spacing={0} align="end">
                          <Text fontWeight="bold" fontSize="md" color="red.500">
                            -{formatMoney(item.amount, settings)}
                          </Text>
                          <Text fontSize="xs" color={mutedText}>
                            {dateFormat(item.expenseDate)}
                          </Text>
                        </Stack>
                        <Flex gap={2} ml={2}>
                          <IconButton
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="teal"
                            borderRadius="lg"
                            aria-label="Edit"
                            onClick={() => confirmUpdateDialog(item._id)}
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            borderRadius="lg"
                            aria-label="Delete"
                            onClick={() => confirmDialog(item._id)}
                          />
                        </Flex>
                      </Flex>
                    </MotionBox>
                  );})}

                <Pagination
                  currentPage={parseInt(currentPage)}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  display={data?.data?.totalExpenses <= 5 || isLoading ? "none" : "flex"}
                />
              </Stack>
            </GridItem>
          </Grid>
        </Stack>
      </CustomBox>
    </Layout>
  );
};

const Expense = () => {
  return (
    <Suspense>
      <ExpenseContent />
    </Suspense>
  );
};

export default Expense;
