"use client";
import SignUp from "@/components/Authentication/SignUp";
import Login from "@/components/Authentication/SignIn";
import AuthBranding from "@/components/Authentication/AuthBranding";
import {
  Flex,
  Box,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import NextLink from "next/link";
import { FiArrowLeft, FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

export default function AuthPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "signup") {
        setTabIndex(1);
      } else {
        setTabIndex(0);
      }
    }
  }, []);

  const handleSwitch = () => {
    setTabIndex((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <Flex minH="100vh" direction={{ base: "column", lg: "row" }}>
      {/* Left: Branding */}
      <AuthBranding />

      {/* Right: Form Area */}
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
        {/* Top Controls */}
        <Flex position="absolute" top={4} left={4} right={4} justify="space-between" zIndex={10}>
          <IconButton
            as={NextLink}
            href="/"
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

        {/* Tab Switcher */}
        <Box w="full" maxW="md">
          <Flex
            bg="gray.100"
            _dark={{ bg: "gray.800" }}
            p={1}
            borderRadius="full"
            mb={8}
            w="fit-content"
            mx="auto"
          >
            {["Sign In", "Sign Up"].map((label, idx) => (
              <Box
                key={label}
                position="relative"
                px={6}
                py={2}
                borderRadius="full"
                cursor="pointer"
                fontSize="sm"
                fontWeight="semibold"
                color={tabIndex === idx ? "white" : "gray.500"}
                transition="color 0.2s"
                onClick={() => setTabIndex(idx)}
                zIndex={1}
              >
                {tabIndex === idx && (
                  <MotionBox
                    layoutId="auth-tab"
                    position="absolute"
                    inset={0}
                    bg="teal.500"
                    borderRadius="full"
                    zIndex={-1}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {label}
              </Box>
            ))}
          </Flex>

          {/* Animated Form Switch */}
          <AnimatePresence mode="wait">
            <MotionBox
              key={tabIndex}
              initial={{ opacity: 0, x: tabIndex === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tabIndex === 0 ? 20 : -20 }}
              transition={{ duration: 0.25 }}
            >
              {tabIndex === 0 ? (
                <Login onSwitch={handleSwitch} />
              ) : (
                <SignUp
                  onRegisterSuccess={() => setTabIndex(0)}
                  onSwitch={handleSwitch}
                />
              )}
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Flex>
    </Flex>
  );
}
