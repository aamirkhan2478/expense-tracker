"use client";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useToast,
  Checkbox,
  Flex,
  Icon,
  InputLeftElement,
  FormErrorMessage,
  Progress,
} from "@chakra-ui/react";
import React from "react";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi";
import { useState } from "react";
import { Field, Form, Formik } from "formik";
import { object, ref, string } from "yup";
import { motion } from "framer-motion";
import { useSignUpUser } from "@/hooks/useAuth";

const MotionStack = motion(Stack);

const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[!@#$%^&*]/.test(password)) strength += 25;
  return strength;
};

const strengthColor = (strength) => {
  if (strength <= 25) return "red";
  if (strength <= 50) return "orange";
  if (strength <= 75) return "yellow";
  return "green";
};

const strengthLabel = (strength) => {
  if (strength <= 25) return "Weak";
  if (strength <= 50) return "Fair";
  if (strength <= 75) return "Good";
  return "Strong";
};

const SignUp = ({ onRegisterSuccess, onSwitch }) => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const { mutate, isLoading, isSuccess } = useSignUpUser(onSuccess, onError);

  const initialValues = {
    name: "",
    email: "",
    password: "",
    cpassword: "",
    agree: false,
  };

  const clickHandler = (values) => {
    const data = {
      name: values.name,
      email: values.email,
      password: values.password,
    };
    mutate(data, {
      onSuccess: () => {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      },
    });
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
      title: error.response?.data?.error || "Registration failed",
      status: "error",
      isClosable: true,
    });
  }

  return (
    <MotionStack
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      spacing={5}
      w="full"
      maxW="md"
      mx="auto"
    >
      <Box textAlign="center" mb={2}>
        <Text fontSize="2xl" fontWeight="bold" mb={1}>
          Create Account
        </Text>
        <Text fontSize="sm" color="gray.500">
          Get started with your free account today
        </Text>
      </Box>

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
              "Name should have at least 3 characters and should not contain numbers!",
            )
            .required("Name is required!"),
          email: string()
            .required("Email is required!")
            .email("Invalid Email!"),
          password: string()
            .required("Password is required!")
            .matches(
              /^(?=.*[0-9])(?=.*[A-Z ])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&* ]{8,20}$/,
              "Password must contain at least 8 characters, 1 number, 1 upper, 1 lowercase and 1 special character!",
            ),
          cpassword: string()
            .oneOf([ref("password"), null], "Passwords do not match!")
            .required("Confirm Password is required!"),
          agree: string().oneOf(["true"], "You must agree to the terms!"),
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
          setFieldValue,
        }) => {
          const passwordStrength = getPasswordStrength(values.password);

          return (
            <Form>
              <Stack spacing={4}>
                <FormControl
                  isInvalid={Boolean(errors.name) && Boolean(touched.name)}
                >
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Full Name
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" h="full">
                      <Icon as={FiUser} color="gray.400" />
                    </InputLeftElement>
                    <Field
                      as={Input}
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      borderRadius="xl"
                      focusBorderColor="teal.400"
                      isInvalid={Boolean(errors.name) && Boolean(touched.name)}
                      onBlur={handleBlur}
                      onChange={handleChange("name")}
                      value={values.name || ""}
                    />
                  </InputGroup>
                  <FormErrorMessage>
                    {Boolean(touched.name) && errors.name}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={Boolean(errors.email) && Boolean(touched.email)}
                >
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Email Address
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" h="full">
                      <Icon as={FiMail} color="gray.400" />
                    </InputLeftElement>
                    <Field
                      as={Input}
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      borderRadius="xl"
                      focusBorderColor="teal.400"
                      isInvalid={Boolean(errors.email) && Boolean(touched.email)}
                      onBlur={handleBlur}
                      onChange={handleChange("email")}
                      value={values.email || ""}
                    />
                  </InputGroup>
                  <FormErrorMessage>
                    {Boolean(touched.email) && errors.email}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={Boolean(errors.password) && Boolean(touched.password)}
                >
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" h="full">
                      <Icon as={FiLock} color="gray.400" />
                    </InputLeftElement>
                    <Field
                      as={Input}
                      type={show ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      borderRadius="xl"
                      focusBorderColor="teal.400"
                      isInvalid={
                        Boolean(errors.password) && Boolean(touched.password)
                      }
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange("password")(e);
                      }}
                      value={values.password || ""}
                    />
                    <InputRightElement h="full" pr={1}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClick}
                        tabIndex={-1}
                      >
                        <Icon as={show ? FiEyeOff : FiEye} color="gray.400" />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {values.password && (
                    <Box mt={2}>
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontSize="xs" color="gray.500">
                          Password strength
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          color={`${strengthColor(passwordStrength)}.500`}
                        >
                          {strengthLabel(passwordStrength)}
                        </Text>
                      </Flex>
                      <Progress
                        value={passwordStrength}
                        size="xs"
                        colorScheme={strengthColor(passwordStrength)}
                        borderRadius="full"
                        bg="gray.100"
                      />
                    </Box>
                  )}
                  <FormErrorMessage>
                    {Boolean(touched.password) && errors.password}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={Boolean(errors.cpassword) && Boolean(touched.cpassword)}
                >
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Confirm Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" h="full">
                      <Icon as={FiLock} color="gray.400" />
                    </InputLeftElement>
                    <Field
                      as={Input}
                      type={show ? "text" : "password"}
                      name="cpassword"
                      placeholder="Confirm your password"
                      borderRadius="xl"
                      focusBorderColor="teal.400"
                      isInvalid={
                        Boolean(errors.cpassword) && Boolean(touched.cpassword)
                      }
                      onBlur={handleBlur}
                      onChange={handleChange("cpassword")}
                      value={values.cpassword || ""}
                    />
                  </InputGroup>
                  <FormErrorMessage>
                    {Boolean(touched.cpassword) && errors.cpassword}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={Boolean(errors.agree) && Boolean(touched.agree)}
                >
                  <Checkbox
                    name="agree"
                    isChecked={values.agree === "true" || values.agree === true}
                    onChange={(e) =>
                      setFieldValue("agree", e.target.checked ? "true" : "")
                    }
                    colorScheme="teal"
                    size="sm"
                  >
                    <Text fontSize="sm" color="gray.500">
                      I agree to the{" "}
                      <Text as="span" color="teal.500" fontWeight="medium">
                        Terms of Service
                      </Text>{" "}
                      and{" "}
                      <Text as="span" color="teal.500" fontWeight="medium">
                        Privacy Policy
                      </Text>
                    </Text>
                  </Checkbox>
                  <FormErrorMessage>{errors.agree}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  borderRadius="xl"
                  bg="teal.500"
                  color="white"
                  fontWeight="bold"
                  _hover={{ bg: "teal.400", transform: "translateY(-1px)" }}
                  _active={{ bg: "teal.600" }}
                  transition="all 0.2s"
                  isLoading={isLoading}
                  onClick={handleSubmit}
                  isDisabled={!isValid || !dirty}
                  boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
                >
                  Create Account
                </Button>
              </Stack>
            </Form>
          );
        }}
      </Formik>

      <Flex align="center" gap={4} pt={2}>
        <Box flex={1} h="1px" bg="gray.200" />
        <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
          or
        </Text>
        <Box flex={1} h="1px" bg="gray.200" />
      </Flex>

      <Text textAlign="center" fontSize="sm" color="gray.500">
        Already have an account?{" "}
        <Text
          as="span"
          color="teal.500"
          fontWeight="semibold"
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
          onClick={onSwitch}
        >
          Sign in instead
        </Text>
      </Text>
    </MotionStack>
  );
};

export default SignUp;
