"use client";
import Alert from "@/components/Alert";
import CustomBox from "@/components/CustomBox";
import Dialog from "@/components/Dialog";
import Layout from "@/components/Layout";
import Pagination from "@/components/Pagination";
import {
  useAddIncome,
  useDeleteIncome,
  useShowIncome,
  useUpdateIncome,
} from "@/hooks/useIncome";
import { useSettings, formatMoney } from "@/hooks/useSettings";
import { calculateIncome } from "@/logic/calculations";
import dateFormat from "@/utils/dateFormat";
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
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiDollarSign,
  FiBriefcase,
  FiTag,
  FiTrendingUp,
} from "react-icons/fi";
import { useQueryClient } from "react-query";
import { BeatLoader } from "react-spinners";
import { date, number, object, string } from "yup";

const MotionBox = motion(Box);

const Income = () => {
  let id = "";
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("user"));
    id = user?.id || "";
  }

  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const [incomeDate, setIncomeDate] = useState("");
  const { data, isFetching } = useShowIncome(
    id || "",
    5,
    currentPage,
    incomeDate,
  );
  const { mutate, isLoading } = useAddIncome(onSuccess, onError);
  const { mutate: updateIncome, isLoading: updateLoading } = useUpdateIncome(
    onSuccess,
    onError,
  );
  const { mutate: deleteIncome, isLoading: deleteLoading } = useDeleteIncome(
    onErrorDelete,
    onSuccessDelete,
  );
  const toast = useToast();
  const queryClient = useQueryClient();

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDialogOpen,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure();
  const [incomeId, setIncomeId] = useState("");

  const income = data?.data?.data?.find((item) => item._id === incomeId);
  const initialValues = {
    companyName: income?.companyName || "",
    title: income?.title || "",
    amount: income?.amount || "",
    incomeDate: dateFormat(income?.incomeDate, "YYYY-MM-DD") || "",
  };
  const totalPages = Math.ceil(data?.data?.totalIncomes / 5);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const clickHandler = (values, { resetForm }) => {
    const newData = {
      companyName: values.companyName,
      title: values.title,
      amount: values.amount,
      incomeDate: values.incomeDate,
      user: id,
    };
    mutate(newData, {
      onSuccess: () => {
        resetForm();
      },
    });
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
      title: error.response?.data?.error || "Something went wrong",
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

  const confirmUpdateDialog = (id) => {
    setIncomeId(id);
    onOpenDialog();
  };

  const updateHandler = (values) => {
    const newData = {
      id: incomeId,
      companyName: values.companyName,
      title: values.title,
      amount: values.amount,
      incomeDate: values.incomeDate,
    };

    updateIncome(newData, {
      onSuccess: () => {
        onCloseDialog();
      },
    });
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
      title: error.response?.data?.error || "Delete failed",
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
        alertBody={"Are you sure you want to delete this income? This action cannot be undone."}
        confirmButtonText={"Delete"}
        isLoading={deleteLoading}
      />
      <Dialog
        isOpen={isDialogOpen}
        onClose={onCloseDialog}
        title={"Update Income"}
        body={
          <Box>
            <Formik
              initialValues={initialValues}
              onSubmit={updateHandler}
              validationSchema={object({
                companyName: string()
                  .matches(
                    /^(?=.{3,30}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z0-9 ]+(?<![_.])$/,
                    "Company Name should have at least 3 characters, should not any number and start with capital letter!",
                  )
                  .required("Title is required field!"),
                title: string()
                  .matches(
                    /^(?=.{3,30}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z0-9 ]+(?<![_.])$/,
                    "Title should have at least 3 characters, should not any number and start with capital letter!",
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
                  <Stack spacing={4}>
                    <FormControl isInvalid={Boolean(errors.companyName) && Boolean(touched.companyName)}>
                      <FormLabel fontSize="sm" fontWeight="medium">Income Company Name</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none"><Icon as={FiBriefcase} color="gray.400" /></InputLeftElement>
                        <Field
                          as={Input}
                          type="text"
                          placeholder="Company Name"
                          name="companyName"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          pl={10}
                          isInvalid={Boolean(errors.companyName) && Boolean(touched.companyName)}
                          onBlur={handleBlur}
                          onChange={handleChange("companyName")}
                          value={values.companyName || ""}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.companyName}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={Boolean(errors.title) && Boolean(touched.title)}>
                      <FormLabel fontSize="sm" fontWeight="medium">Income Title</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none"><Icon as={FiTag} color="gray.400" /></InputLeftElement>
                        <Field
                          as={Input}
                          type="text"
                          placeholder="Income Title"
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
                      <FormLabel fontSize="sm" fontWeight="medium">Income Amount</FormLabel>
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

                    <FormControl isInvalid={Boolean(errors.incomeDate) && Boolean(touched.incomeDate)}>
                      <FormLabel fontSize="sm" fontWeight="medium">Income Date</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none"><Icon as={FiCalendar} color="gray.400" /></InputLeftElement>
                        <Field
                          as={Input}
                          type="date"
                          name="incomeDate"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          pl={10}
                          isInvalid={Boolean(errors.incomeDate) && Boolean(touched.incomeDate)}
                          onBlur={handleBlur}
                          onChange={handleChange("incomeDate")}
                          value={values.incomeDate || ""}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.incomeDate}</FormErrorMessage>
                    </FormControl>

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

      <CustomBox>
        <Stack spacing={8}>
          {/* Header */}
          <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
            <Box>
              <Heading size="lg" fontWeight="bold" mb={1}>
                Income
              </Heading>
              <Text fontSize="sm" color={mutedText}>
                Track and manage your income sources
              </Text>
            </Box>
            <Badge
              colorScheme="green"
              variant="subtle"
              px={4}
              py={2}
              borderRadius="xl"
              fontSize="md"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={FiTrendingUp} />
              <Skeleton isLoaded={!isFetching}>
                <Text fontWeight="bold">
                  {formatMoney(!incomeDate ? data?.data?.totalAmount || 0 : calculateIncome(data?.data?.data), settings)}
                </Text>
              </Skeleton>
            </Badge>
          </Flex>

          {/* Main Grid */}
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
                  Add New Income
                </Text>
                <Formik
                  initialValues={{ companyName: "", title: "", amount: "", incomeDate: "" }}
                  onSubmit={clickHandler}
                  validationSchema={object({
                    companyName: string()
                      .matches(
                        /^(?=.{3,30}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
                        "Company Name should have at least 3 characters, should not any number and start with capital letter!",
                      )
                      .required("Title is required field!"),
                    title: string()
                      .matches(
                        /^(?=.{3,20}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
                        "Title should have at least 3 characters, should not any number and start with capital letter!",
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
                      <Stack spacing={4}>
                        <FormControl isInvalid={Boolean(errors.companyName) && Boolean(touched.companyName)}>
                          <FormLabel fontSize="sm" fontWeight="medium">Company Name</FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none"><Icon as={FiBriefcase} color="gray.400" /></InputLeftElement>
                            <Field
                              as={Input}
                              type="text"
                              placeholder="Company Name"
                              name="companyName"
                              borderRadius="xl"
                              focusBorderColor="teal.400"
                              pl={10}
                              isInvalid={Boolean(errors.companyName) && Boolean(touched.companyName)}
                              onBlur={handleBlur}
                              onChange={handleChange("companyName")}
                              value={values.companyName || ""}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.companyName}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={Boolean(errors.title) && Boolean(touched.title)}>
                          <FormLabel fontSize="sm" fontWeight="medium">Title</FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none"><Icon as={FiTag} color="gray.400" /></InputLeftElement>
                            <Field
                              as={Input}
                              type="text"
                              placeholder="Income Title"
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

                        <FormControl isInvalid={Boolean(errors.incomeDate) && Boolean(touched.incomeDate)}>
                          <FormLabel fontSize="sm" fontWeight="medium">Date</FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none"><Icon as={FiCalendar} color="gray.400" /></InputLeftElement>
                            <Field
                              as={Input}
                              type="date"
                              name="incomeDate"
                              borderRadius="xl"
                              focusBorderColor="teal.400"
                              pl={10}
                              isInvalid={Boolean(errors.incomeDate) && Boolean(touched.incomeDate)}
                              onBlur={handleBlur}
                              onChange={handleChange("incomeDate")}
                              value={values.incomeDate || ""}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.incomeDate}</FormErrorMessage>
                        </FormControl>

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
                          isLoading={isLoading}
                          spinner={<BeatLoader size={8} color="white" />}
                          borderRadius="xl"
                          boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
                        >
                          Add Income
                        </Button>
                      </Stack>
                    </Form>
                  )}
                </Formik>
              </MotionBox>
            </GridItem>

            {/* List */}
            <GridItem>
              <Stack spacing={4}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="bold">
                    Recent Incomes
                  </Text>
                  <Input
                    type="month"
                    onChange={(e) => setIncomeDate(e.target.value)}
                    size="sm"
                    w="160px"
                    borderRadius="xl"
                    focusBorderColor="teal.400"
                  />
                </Flex>

                {isFetching &&
                  [1, 2, 3].map((i) => (
                    <Skeleton key={i} height="80px" borderRadius="xl" />
                  ))}

                {!isFetching && data?.data?.data?.length === 0 && (
                  <Box
                    p={8}
                    textAlign="center"
                    borderRadius="2xl"
                    border="1px dashed"
                    borderColor={borderColor}
                  >
                    <Icon as={FiTrendingUp} boxSize={8} color="gray.300" mb={3} />
                    <Text fontWeight="medium" color={mutedText}>
                      No incomes found
                    </Text>
                    <Text fontSize="sm" color={mutedText}>
                      Add your first income to get started
                    </Text>
                  </Box>
                )}

                {!isFetching &&
                  data?.data?.data?.map((item) => (
                    <MotionBox
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      bg={bgCard}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="xl"
                      p={4}
                      boxShadow="sm"
                      _hover={{ boxShadow: "md", borderColor: "green.200" }}
                      transition={{ duration: 0.2 }}
                    >
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap={3}>
                          <Flex
                            w={10}
                            h={10}
                            borderRadius="xl"
                            bg="green.50"
                            align="center"
                            justify="center"
                          >
                            <Icon as={FiTrendingUp} color="green.500" />
                          </Flex>
                          <Stack spacing={0}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {item.companyName}
                            </Text>
                            <Text fontSize="xs" color={mutedText}>
                              {item.title}
                            </Text>
                          </Stack>
                        </Flex>
                        <Stack spacing={0} align="end">
                          <Text fontWeight="bold" fontSize="md" color="green.500">
                            +{formatMoney(item.amount, settings)}
                          </Text>
                          <Text fontSize="xs" color={mutedText}>
                            {dateFormat(item.incomeDate)}
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
                  ))}

                <Pagination
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  totalPages={totalPages}
                  display={data?.data?.totalIncomes <= 5 || isFetching ? "none" : "flex"}
                />
              </Stack>
            </GridItem>
          </Grid>
        </Stack>
      </CustomBox>
    </Layout>
  );
};

export default Income;
