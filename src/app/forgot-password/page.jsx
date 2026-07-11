"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useToast,
  Icon,
  FormErrorMessage,
  Flex,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiMail, FiArrowLeft, FiSun, FiMoon, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import NextLink from "next/link";
import axios from "axios";
import AuthBranding from "@/components/Authentication/AuthBranding";

const MotionStack = motion(Stack);

export default function ForgotPasswordPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
      toast({
        title: res.data.message || "Reset link sent",
        status: "success",
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: err.response?.data?.error || "Something went wrong",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" direction={{ base: "column", lg: "row" }}>
      <AuthBranding />

      <Flex
        w={{ base: "100%", lg: "50%" }}
        minH={{ base: "auto", lg: "100vh" }}
        align="center"
        justify="center"
        position="relative"
        p={{ base: 6, md: 12 }}
        bg="white"
        _dark={{ bg: "gray.900" }}
      >
        <Flex position="absolute" top={4} left={4} right={4} justify="space-between" zIndex={10}>
          <IconButton
            as={NextLink}
            href="/auth"
            icon={<FiArrowLeft />}
            variant="ghost"
            size="sm"
            aria-label="Go back"
            borderRadius="full"
          />
          <IconButton
            icon={colorMode === "dark" ? <FiSun /> : <FiMoon />}
            onClick={() => toggleColorMode()}
            variant="ghost"
            size="sm"
            aria-label="Toggle theme"
            borderRadius="full"
          />
        </Flex>

        <Box w="full" maxW="md">
          <MotionStack
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            spacing={6}
            w="full"
            maxW="md"
            mx="auto"
          >
            {sent ? (
              <Stack spacing={6} textAlign="center">
                <Icon as={FiCheckCircle} boxSize={16} color="teal.500" mx="auto" />
                <Text fontSize="2xl" fontWeight="bold">
                  Check your email
                </Text>
                <Text fontSize="sm" color="gray.500">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>.<br />
                  If you don&apos;t see it, check your spam folder.
                </Text>
                <Button
                  as={NextLink}
                  href="/auth"
                  size="lg"
                  borderRadius="xl"
                  bg="teal.500"
                  color="white"
                  fontWeight="bold"
                  _hover={{ bg: "teal.400" }}
                >
                  Back to Sign In
                </Button>
              </Stack>
            ) : (
              <>
                <Box textAlign="center" mb={2}>
                  <Text fontSize="2xl" fontWeight="bold" mb={1}>
                    Forgot Password?
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Enter your email and we&apos;ll send you a reset link
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
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        size="lg"
                        borderRadius="xl"
                        focusBorderColor="teal.400"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
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
                    isLoading={loading}
                    boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
                  >
                    Send Reset Link
                  </Button>
                </Stack>

                <Text textAlign="center" fontSize="sm" color="gray.500">
                  Remember your password?{" "}
                  <Text
                    as={NextLink}
                    href="/auth"
                    color="teal.500"
                    fontWeight="semibold"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Sign In
                  </Text>
                </Text>
              </>
            )}
          </MotionStack>
        </Box>
      </Flex>
    </Flex>
  );
}
