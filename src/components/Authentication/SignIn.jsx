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
import NextLink from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const MotionStack = motion(Stack);

const SignIn = ({ onSwitch }) => {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);
  const toast = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const [user, setUser] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!user.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!user.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Prevent duplicate submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await login({
        email: user.email.trim().toLowerCase(),
        password: user.password,
        rememberMe: user.rememberMe,
      });

      if (result.success) {
        toast({
          title: result.data?.message || "Login successful",
          status: "success",
          isClosable: true,
        });

        // Check for redirect destination
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
          router.push(redirect);
        } else {
          router.push("/dashboard");
        }
      } else {
        // Handle email not verified
        if (result.code === "EMAIL_NOT_VERIFIED") {
          toast({
            title: "Email not verified",
            description: result.error,
            status: "warning",
            duration: 8000,
            isClosable: true,
          });
        } else {
          toast({
            title: result.error || "Login failed",
            status: "error",
            isClosable: true,
          });
        }

        // Clear password on failed login
        setUser((prev) => ({ ...prev, password: "" }));
      }
    } catch (error) {
      toast({
        title: "An unexpected error occurred",
        status: "error",
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              autoComplete="email"
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
              borderRadius="xl"
              focusBorderColor="teal.400"
              autoComplete="current-password"
            />
            <InputRightElement h="full" pr={1}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShow(!show)}
                tabIndex={-1}
                type="button"
              >
                <Icon as={show ? FiEyeOff : FiEye} color="gray.400" />
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <Flex justify="space-between" align="center">
          <Checkbox
            name="rememberMe"
            isChecked={user.rememberMe}
            onChange={changeHandler}
            size="sm"
            colorScheme="teal"
          >
            Remember me
          </Checkbox>
          <Text
            as={NextLink}
            href="/forgot-password"
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
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
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
