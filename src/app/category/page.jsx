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
import dateFormat from "@/utils/dateFormat";
import {
  Box,
  Button,
  Divider,
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
import Image from "next/image";
import { useState } from "react";
import { FiEdit, FiPlus, FiTrash } from "react-icons/fi";
import { useQueryClient } from "react-query";
import { BeatLoader } from "react-spinners";
import { object, string } from "yup";

const Category = () => {
  const { data: session } = useSession();
  const id = session?.user?.id;
  const { data, isLoading } = useShowCategory(id || "");
  const { mutate, isLoading: categoryLoading } = useAddCategory(
    onSuccess,
    onError
  );
  const { mutate: updateCategory, isLoading: updateLoading } = useUpdateCategory(
    onSuccess,
    onError
  );
  const { mutate: deleteCategory, isLoading: deleteLoading } =
    useDeleteCategory(onErrorDelete, onSuccessDelete);
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgCard = useColorModeValue("white", "dark");
  const inputOutlineColor = useColorModeValue("gray.400", "");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [categoryId, setCategoryId] = useState("");
  const {
    isOpen: isOpenDialog,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure();

  const category = data?.data?.categories?.find((item) => item._id === categoryId);
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
      title: error.response.data.error,
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
        alertHeader={"Delete Category"}
        alertBody={"Are you sure you want to delete this category?"}
        confirmButtonText={"Yes"}
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
                    "Title should have at least 3 characters, should not any number and start with capital letter!"
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
                  <FormControl id="category-name" mb="20px" isRequired>
                    <FormLabel>Category Name</FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      placeholder="Category Name"
                      outlineColor={inputOutlineColor}
                      name="name"
                      isInvalid={Boolean(errors.name) && Boolean(touched.name)}
                      onBlur={handleBlur}
                      onChange={handleChange("name")}
                      value={values.name || ""}
                    />
                    <FormHelperText color="red">
                      {Boolean(touched.name) && errors.name}
                    </FormHelperText>
                  </FormControl>
                  <FormControl id="category-icon" mb="20px" isRequired>
                    <FormLabel>Category Icon</FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      placeholder="Category Icon"
                      outlineColor={inputOutlineColor}
                      name="icon"
                      isInvalid={Boolean(errors.icon) && Boolean(touched.icon)}
                      onBlur={handleBlur}
                      onChange={handleChange("icon")}
                      value={values.icon || ""}
                    />
                    <FormHelperText color="red">
                      {Boolean(touched.icon) && errors.icon}
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
                      Update Category
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        }
      />
      <CustomBox>
        <Heading p="4" fontFamily={"monospace"}>
          Category
        </Heading>
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
                resetForm();
              }}
              validationSchema={object({
                name: string()
                  .matches(
                    /^(?=.{3,20}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
                    "Title should have at least 3 characters, should not any number and start with capital letter!"
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
                  <FormControl id="category-name" mb="20px" isRequired>
                    <FormLabel>Category Name</FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      placeholder="Category Name"
                      outlineColor={inputOutlineColor}
                      name="name"
                      isInvalid={Boolean(errors.name) && Boolean(touched.name)}
                      onBlur={handleBlur}
                      onChange={handleChange("name")}
                      value={values.name || ""}
                    />
                    <FormHelperText color="red">
                      {Boolean(touched.name) && errors.name}
                    </FormHelperText>
                  </FormControl>
                  <FormControl id="category-icon" mb="20px" isRequired>
                    <FormLabel>Category Icon</FormLabel>
                    <Field
                      as={Input}
                      type="text"
                      placeholder="Category Icon"
                      outlineColor={inputOutlineColor}
                      name="icon"
                      isInvalid={Boolean(errors.icon) && Boolean(touched.icon)}
                      onBlur={handleBlur}
                      onChange={handleChange("icon")}
                      value={values.icon || ""}
                    />
                    <FormHelperText color="red">
                      {Boolean(touched.icon) && errors.icon}
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
                    isLoading={categoryLoading}
                    spinner={<BeatLoader size={8} color="white" />}
                  >
                    Add Category
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

            {data?.data?.categories?.length === 0 && (
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
                  No Categories found
                </Text>
              </Box>
            )}
            {data?.data?.categories?.map((item) => (
              <Box
                key={item._id}
                borderWidth="1px"
                borderRadius={"10px"}
                bg={bgCard}
                m="10px"
                shadow={"lg"}
              >
                <Flex
                  p="10px"
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Image src={item.icon} height={40} width={40} alt="icon" />
                  <Box w={"50%"}>
                    <Text
                      fontFamily={"monospace"}
                      fontSize={{ base: "md", md: "xl" }}
                      fontWeight={"bold"}
                      mb={{ base: "5px", md: "0" }}
                    >
                      {item.name}
                    </Text>
                  </Box>
                  <Box w={"20%"} display={"flex"} gap={2}>
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
          </Box>
        </Flex>
      </CustomBox>
    </Layout>
  );
};

export default Category;
