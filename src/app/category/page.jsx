"use client";
import Alert from "@/components/Alert";
import CustomBox from "@/components/CustomBox";
import Dialog from "@/components/Dialog";
import Layout from "@/components/Layout";
import {
  useAddCategory,
  useDeleteCategory,
  useShowCategory,
  useUpdateCategory,
} from "@/hooks/useCategory";
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
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiTag,
  FiImage,
  FiGrid,
} from "react-icons/fi";
import { useQueryClient } from "react-query";
import { BeatLoader } from "react-spinners";
import { object, string } from "yup";

const MotionBox = motion(Box);

const Category = () => {
  let id = "";
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem("user"));
    id = user?.id || "";
  }

  const { data, isLoading } = useShowCategory(id || "");
  const { mutate, isLoading: categoryLoading } = useAddCategory(
    onSuccess,
    onError,
  );
  const { mutate: updateCategory, isLoading: updateLoading } =
    useUpdateCategory(onSuccess, onError);
  const { mutate: deleteCategory, isLoading: deleteLoading } =
    useDeleteCategory(onErrorDelete, onSuccessDelete);
  const toast = useToast();
  const queryClient = useQueryClient();

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [categoryId, setCategoryId] = useState("");
  const {
    isOpen: isOpenDialog,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure();

  const category = data?.data?.categories?.find(
    (item) => item._id === categoryId,
  );
  const initialValues = {
    name: category?.name || "",
    icon: category?.icon || "",
  };
  const clickHandler = (values) => {
    const newData = {
      name: values.name,
      icon: values.icon,
      user: id,
    };
    mutate(newData);
  };

  function onSuccess(data) {
    queryClient.invalidateQueries(["show-categories", id]);
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
    setCategoryId(id);
    onOpen();
  };

  const deleteHandler = () => {
    deleteCategory(categoryId);
  };

  const confirmUpdateDialog = (id) => {
    setCategoryId(id);
    onOpenDialog();
  };

  const updateHandler = (values) => {
    const newData = {
      id: categoryId,
      name: values.name,
      icon: values.icon,
    };

    updateCategory(newData, {
      onSuccess: () => {
        onCloseDialog();
      },
    });
  };

  function onSuccessDelete(data) {
    onClose();
    queryClient.invalidateQueries(["show-categories", id]);
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
        alertHeader={"Delete Category"}
        alertBody={"Are you sure you want to delete this category? This action cannot be undone."}
        confirmButtonText={"Delete"}
        isLoading={deleteLoading}
      />
      <Dialog
        isOpen={isOpenDialog}
        onClose={onCloseDialog}
        title={"Update Category"}
        body={
          <Box>
            <Formik
              initialValues={initialValues}
              onSubmit={updateHandler}
              validationSchema={object({
                name: string()
                  .matches(
                    /^(?=.{3,50}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
                    "Title should have at least 3 characters, should not any number and start with capital letter!",
                  )
                  .required("Title is required field!"),
                icon: string()
                  .url("Icon should be a valid url!")
                  .required("Icon is required field!"),
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
                    <FormControl isInvalid={Boolean(errors.name) && Boolean(touched.name)}>
                      <FormLabel fontSize="sm" fontWeight="medium">Category Name</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none"><Icon as={FiTag} color="gray.400" /></InputLeftElement>
                        <Field
                          as={Input}
                          type="text"
                          placeholder="Category Name"
                          name="name"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          pl={10}
                          isInvalid={Boolean(errors.name) && Boolean(touched.name)}
                          onBlur={handleBlur}
                          onChange={handleChange("name")}
                          value={values.name || ""}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={Boolean(errors.icon) && Boolean(touched.icon)}>
                      <FormLabel fontSize="sm" fontWeight="medium">Icon URL</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none"><Icon as={FiImage} color="gray.400" /></InputLeftElement>
                        <Field
                          as={Input}
                          type="text"
                          placeholder="https://example.com/icon.png"
                          name="icon"
                          borderRadius="xl"
                          focusBorderColor="teal.400"
                          pl={10}
                          isInvalid={Boolean(errors.icon) && Boolean(touched.icon)}
                          onBlur={handleBlur}
                          onChange={handleChange("icon")}
                          value={values.icon || ""}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.icon}</FormErrorMessage>
                    </FormControl>

                    {values.icon && (
                      <Flex justify="center" py={2}>
                        <Box
                          w={16}
                          h={16}
                          borderRadius="xl"
                          bg="gray.50"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          overflow="hidden"
                          border="1px solid"
                          borderColor={borderColor}
                        >
                          <Image src={values.icon} alt="Preview" width={40} height={40} />
                        </Box>
                      </Flex>
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

      <CustomBox>
        <Stack spacing={8}>
          {/* Header */}
          <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
            <Box>
              <Heading size="lg" fontWeight="bold" mb={1}>
                Categories
              </Heading>
              <Text fontSize="sm" color={mutedText}>
                Organize your transactions with custom categories
              </Text>
            </Box>
            <Flex
              align="center"
              gap={2}
              bg="teal.50"
              _dark={{ bg: "teal.900" }}
              color="teal.600"
              px={4}
              py={2}
              borderRadius="xl"
              fontSize="sm"
              fontWeight="medium"
            >
              <Icon as={FiGrid} />
              <Skeleton isLoaded={!isLoading}>
                {data?.data?.categories?.length || 0} Categories
              </Skeleton>
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
                  Add New Category
                </Text>
                <Formik
                  initialValues={{ name: "", icon: "" }}
                  onSubmit={async (values, { resetForm }) => {
                    await clickHandler(values);
                    resetForm();
                  }}
                  validationSchema={object({
                    name: string()
                      .matches(
                        /^(?=.{3,20}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
                        "Title should have at least 3 characters, should not any number and start with capital letter!",
                      )
                      .required("Title is required field!"),
                    icon: string()
                      .url("Icon should be a valid url!")
                      .required("Icon is required field!"),
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
                        <FormControl isInvalid={Boolean(errors.name) && Boolean(touched.name)}>
                          <FormLabel fontSize="sm" fontWeight="medium">Category Name</FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none"><Icon as={FiTag} color="gray.400" /></InputLeftElement>
                            <Field
                              as={Input}
                              type="text"
                              placeholder="e.g. Food, Travel"
                              name="name"
                              borderRadius="xl"
                              focusBorderColor="teal.400"
                              pl={10}
                              isInvalid={Boolean(errors.name) && Boolean(touched.name)}
                              onBlur={handleBlur}
                              onChange={handleChange("name")}
                              value={values.name || ""}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.name}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={Boolean(errors.icon) && Boolean(touched.icon)}>
                          <FormLabel fontSize="sm" fontWeight="medium">Icon URL</FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none"><Icon as={FiImage} color="gray.400" /></InputLeftElement>
                            <Field
                              as={Input}
                              type="text"
                              placeholder="https://example.com/icon.png"
                              name="icon"
                              borderRadius="xl"
                              focusBorderColor="teal.400"
                              pl={10}
                              isInvalid={Boolean(errors.icon) && Boolean(touched.icon)}
                              onBlur={handleBlur}
                              onChange={handleChange("icon")}
                              value={values.icon || ""}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.icon}</FormErrorMessage>
                        </FormControl>

                        {values.icon && (
                          <Flex justify="center" py={2}>
                            <Box
                              w={16}
                              h={16}
                              borderRadius="xl"
                              bg="gray.50"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              overflow="hidden"
                              border="1px solid"
                              borderColor={borderColor}
                            >
                              <Image src={values.icon} alt="Preview" width={40} height={40} />
                            </Box>
                          </Flex>
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
                          isLoading={categoryLoading}
                          spinner={<BeatLoader size={8} color="white" />}
                          borderRadius="xl"
                          boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
                        >
                          Add Category
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
                <Text fontSize="lg" fontWeight="bold">
                  All Categories
                </Text>

                {isLoading &&
                  [1, 2, 3].map((i) => (
                    <Skeleton key={i} height="72px" borderRadius="xl" />
                  ))}

                {!isLoading && data?.data?.categories?.length === 0 && (
                  <Box
                    p={8}
                    textAlign="center"
                    borderRadius="2xl"
                    border="1px dashed"
                    borderColor={borderColor}
                  >
                    <Icon as={FiGrid} boxSize={8} color="gray.300" mb={3} />
                    <Text fontWeight="medium" color={mutedText}>
                      No categories found
                    </Text>
                    <Text fontSize="sm" color={mutedText}>
                      Add your first category to organize expenses
                    </Text>
                  </Box>
                )}

                {!isLoading &&
                  data?.data?.categories?.map((item) => (
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
                      _hover={{ boxShadow: "md", borderColor: "teal.200" }}
                      transition={{ duration: 0.2 }}
                    >
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap={3}>
                          <Flex
                            w={12}
                            h={12}
                            borderRadius="xl"
                            bg="teal.50"
                            align="center"
                            justify="center"
                            overflow="hidden"
                          >
                            <Image
                              src={item.icon}
                              alt={item.name}
                              width={28}
                              height={28}
                            />
                          </Flex>
                          <Text fontWeight="semibold" fontSize="md">
                            {item.name}
                          </Text>
                        </Flex>
                        <Flex gap={2}>
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
              </Stack>
            </GridItem>
          </Grid>
        </Stack>
      </CustomBox>
    </Layout>
  );
};

export default Category;
