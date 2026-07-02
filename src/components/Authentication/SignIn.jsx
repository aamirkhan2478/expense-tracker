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
} from "@chakra-ui/react";
import React from "react";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSignInUser } from "@/hooks/useAuth";

const MotionStack = motion(Stack);

const SignIn = ({ onSwitch }) => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();

  const {
    mutate,
    isLoading: loading,
  } = useSignInUser(onSuccess, onError);

  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUser((preData) => ({ ...preData, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!user.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      newErrors.email = "Invalid email address";
    if (!user.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutate(user);
  };

  function onSuccess(data) {
    localStorage.setItem("token", data?.data?.token);
    localStorage.setItem("user", JSON.stringify(data?.data?.user));
    document.cookie = `token=${data?.data?.token}; path=/; max-age=86400; SameSite=Strict`;

    toast({
      title: data?.data?.msg,
      status: "success",
      isClosable: true,
    });

    router.push("/dashboard");
  }

  function onError(error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0; SameSite=Strict";

    toast({
      title: error.response?.data?.error || "Login failed",
      status: "error",
      isClosable: true,
    });
  }

  return (
    <MotionStack
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      spacing={6}
      w="full"
      maxW="md"
      mx="auto"
    >
      <Box textAlign="center" mb={2}>
        <Text fontSize="2xl" fontWeight="bold" mb={1}>
          Welcome Back
        </Text>
        <Text fontSize="sm" color="gray.500">
          Enter your credentials to access your account
        </Text>
      </Box>

      <Stack as="form" onSubmit={submitHandler} spacing={5}>
        <FormControl isInvalid={!!errors.email}>
          <FormLabel fontSize="sm" fontWeight="medium">
            Email Address
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FiMail} color="gray.400" />
            </InputLeftElement>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={user.email}
              onChange={changeHandler}
              size="lg"
              borderRadius="xl"
              focusBorderColor="teal.400"
            />
          </InputGroup>
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormLabel fontSize="sm" fontWeight="medium">
            Password
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FiLock} color="gray.400" />
            </InputLeftElement>
            <Input
              type={show ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={user.password}
              onChange={changeHandler}
              onKeyUp={(e) => {
                if (e.key === "Enter") submitHandler(e);
              }}
              borderRadius="xl"
              focusBorderColor="teal.400"
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
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <Flex justify="space-between" align="center">
          <Checkbox size="sm" colorScheme="teal">
            Remember me
          </Checkbox>
          <Text
            fontSize="sm"
            color="teal.500"
            fontWeight="medium"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
          >
            Forgot password?
          </Text>
        </Flex>

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
          isLoading={loading}
          boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
        >
          Sign In
        </Button>
      </Stack>

      <Flex align="center" gap={4}>
        <Box flex={1} h="1px" bg="gray.200" />
        <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
          or
        </Text>
        <Box flex={1} h="1px" bg="gray.200" />
      </Flex>

      <Text textAlign="center" fontSize="sm" color="gray.500">
        Don&apos;t have an account?{" "}
        <Text
          as="span"
          color="teal.500"
          fontWeight="semibold"
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
          onClick={onSwitch}
        >
          Create an account
        </Text>
      </Text>
    </MotionStack>
  );
};

export default SignIn;
