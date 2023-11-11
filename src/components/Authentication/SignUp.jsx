"use client";
import {
  Box,
  useColorModeValue,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  useColorMode,
  FormHelperText,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { FiEye, FiEyeOff, FiMoon, FiSun } from "react-icons/fi";
import { useState } from "react";
import { Field, Form, Formik, useFormik } from "formik";
import { object, ref, string } from "yup";
import { useSignUpUser } from "@/hooks/useAuth";
const SignUp = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const { mutate, isLoading, isSuccess } = useSignUpUser(onSuccess, onError);
  const initialValues = {
    name: "",
    email: "",
    password: "",
    cpassword: "",
  };

  const clickHandler = (values) => {
    const data = {
      name: values.name,
      email: values.email,
      password: values.password,
    };
    mutate(data);
  };

  function onSuccess(data) {
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
  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <Stack spacing={4}>
          <Formik
            initialValues={initialValues}
            onSubmit={async (values, { resetForm }) => {
              await clickHandler(values);
              if (isSuccess) resetForm();
            }}
            validationSchema={object({
              name: string()
                .matches(
                  /^(?=.{3,20}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/,
                  "Name should have at least 3 characters and should not any number!"
                )
                .required("Name is required!"),
              email: string()
                .required("Email is required!")
                .email("Invalid Email!"),
              password: string()
                .required("Password is required!")
                .matches(
                  /^(?=.*[0-9])(?=.*[A-Z ])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&* ]{8,20}$/,
                  "Password must contain at least 8 characters, 1 number, 1 upper, 1 lowercase and 1 special character!"
                ),
              cpassword: string()
                .oneOf([ref("password"), null], "Password not match!")
                .required("Confirm Password is required!"),
            })}
          >
            {({
              errors,
              touched,
              values,
              handleBlur,
              handleChange,
              handleSubmit,
              isValid,
              dirty,
            }) => (
              <Form>
                <FormControl id="name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Field
                    as={Input}
                    type="text"
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
                <FormControl id="email-address" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Field
                    as={Input}
                    type="email"
                    name="email"
                    isInvalid={Boolean(errors.email) && Boolean(touched.email)}
                    onBlur={handleBlur}
                    onChange={handleChange("email")}
                    value={values.email || ""}
                  />
                  <FormHelperText color="red">
                    {Boolean(touched.email) && errors.email}
                  </FormHelperText>
                </FormControl>
                <FormControl id="pass" isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Field
                      as={Input}
                      type={show ? "text" : "password"}
                      name="password"
                      isInvalid={
                        Boolean(errors.password) && Boolean(touched.password)
                      }
                      onBlur={handleBlur}
                      onChange={handleChange("password")}
                      value={values.password || ""}
                    />
                    <InputRightElement
                      width="4.5rem"
                      height="2.3rem"
                      onClick={handleClick}
                      cursor={"pointer"}
                    >
                      {show ? <FiEyeOff /> : <FiEye />}
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText color="red">
                    {Boolean(touched.password) && errors.password}
                  </FormHelperText>
                </FormControl>
                <FormControl id="cpassword" isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup size="md">
                    <Field
                      as={Input}
                      type={show ? "text" : "password"}
                      name="cpassword"
                      isInvalid={
                        Boolean(errors.cpassword) && Boolean(touched.cpassword)
                      }
                      onBlur={handleBlur}
                      onChange={handleChange("cpassword")}
                      value={values.cpassword || ""}
                    />
                    <InputRightElement
                      width="4.5rem"
                      height="2.3rem"
                      onClick={handleClick}
                      cursor={"pointer"}
                    >
                      {show ? <FiEyeOff /> : <FiEye />}
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText color="red">
                    {Boolean(touched.cpassword) && errors.cpassword}
                  </FormHelperText>
                </FormControl>
                <Stack spacing={10}>
                  <Button
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
                    }}
                    _active={{
                      bg: "blue.300",
                    }}
                    type="submit"
                    isLoading={isLoading}
                    onClick={handleSubmit}
                    isDisabled={!isValid || !dirty}
                  >
                    Sign Up
                  </Button>
                  <IconButton
                    icon={colorMode === "dark" ? <FiSun /> : <FiMoon />}
                    onClick={() => toggleColorMode()}
                  />
                </Stack>
              </Form>
            )}
          </Formik>
        </Stack>
      </Box>
    </Stack>
  );
};

export default SignUp;
