"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
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
import { useState, useEffect } from "react";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiSun,
  FiMoon,
  FiCheckCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import AuthBranding from "@/components/Authentication/AuthBranding";

const MotionStack = motion(Stack);

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid or missing token",
        status: "error",
        isClosable: true,
      });
    }
  }, [token, toast]);

  const validate = () => {
    const newErrors = {};
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        password,
      });
      setSuccess(true);
      toast({
        title: res.data.message || "Password reset successfully",
        status: "success",
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: err.response?.data?.error || "Failed to reset password",
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
        <Flex
          position="absolute"
          top={4}
          left={4}
          right={4}
          justify="space-between"
          zIndex={10}
        >
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
            {success ? (
              <Stack spacing={6} textAlign="center">
                <Icon as={FiCheckCircle} boxSize={16} color="teal.500" mx="auto" />
                <Text fontSize="2xl" fontWeight="bold">
                  Password Reset Successful
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Your password has been updated. You can now sign in with your new password.
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
                  Go to Sign In
                </Button>
              </Stack>
            ) : (
              <>
                <Box textAlign="center" mb={2}>
                  <Text fontSize="2xl" fontWeight="bold" mb={1}>
                    Reset Password
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Enter your new password below
                  </Text>
                </Box>

                <Stack as="form" onSubmit={submitHandler} spacing={5}>
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      New Password
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none" h="full">
                        <Icon as={FiLock} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type={show ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password)
                            setErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        borderRadius="xl"
                        focusBorderColor="teal.400"
                      />
                      <InputRightElement h="full" pr={1}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShow(!show)}
                          tabIndex={-1}
                        >
                          <Icon as={show ? FiEyeOff : FiEye} color="gray.400" />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Confirm Password
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none" h="full">
                        <Icon as={FiLock} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword)
                            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                        borderRadius="xl"
                        focusBorderColor="teal.400"
                      />
                      <InputRightElement h="full" pr={1}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirm(!showConfirm)}
                          tabIndex={-1}
                        >
                          <Icon
                            as={showConfirm ? FiEyeOff : FiEye}
                            color="gray.400"
                          />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
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
                    isDisabled={!token}
                    boxShadow="0 4px 14px 0 rgba(20, 184, 166, 0.39)"
                  >
                    Reset Password
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
