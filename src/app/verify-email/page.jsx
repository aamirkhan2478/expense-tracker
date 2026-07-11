"use client";

import {
  Box,
  Button,
  Stack,
  Text,
  useToast,
  Icon,
  Flex,
  IconButton,
  useColorMode,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiSun,
  FiMoon,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import AuthBranding from "@/components/Authentication/AuthBranding";

const MotionStack = motion(Stack);

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.post("/api/auth/verify-email", { token });
        setStatus("success");
        setMessage(res.data.message || "Your email has been verified successfully.");
        toast({
          title: "Email verified",
          status: "success",
          isClosable: true,
        });
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.error ||
            "Failed to verify email. The link may be expired or invalid."
        );
        toast({
          title: "Verification failed",
          status: "error",
          isClosable: true,
        });
      }
    };

    verify();
  }, [token, toast]);

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
            textAlign="center"
          >
            {status === "verifying" && (
              <>
                <Spinner size="xl" color="teal.500" thickness="4px" />
                <Text fontSize="2xl" fontWeight="bold">
                  Verifying your email...
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Please wait while we confirm your email address.
                </Text>
              </>
            )}

            {status === "success" && (
              <>
                <Icon as={FiCheckCircle} boxSize={16} color="teal.500" mx="auto" />
                <Text fontSize="2xl" fontWeight="bold">
                  Email Verified!
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {message}
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
              </>
            )}

            {status === "error" && (
              <>
                <Icon as={FiXCircle} boxSize={16} color="red.500" mx="auto" />
                <Text fontSize="2xl" fontWeight="bold">
                  Verification Failed
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {message}
                </Text>
                <Stack spacing={3}>
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
                  <Button
                    as={NextLink}
                    href="/auth?tab=signup"
                    size="lg"
                    borderRadius="xl"
                    variant="outline"
                    colorScheme="teal"
                    fontWeight="bold"
                  >
                    Create a New Account
                  </Button>
                </Stack>
              </>
            )}
          </MotionStack>
        </Box>
      </Flex>
    </Flex>
  );
}
