"use client";
import SignUp from "@/components/Authentication/SignUp";
import Login from "@/components/Authentication/SignIn";
import {
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  IconButton,
  useColorMode,
  Box,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import NextLink from "next/link";
import { FiArrowLeft, FiSun, FiMoon } from "react-icons/fi";

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

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  return (
    <Box minH="100vh" position="relative">
      <Flex position="absolute" top={4} left={4} gap={2} zIndex={10}>
        <Button
          as={NextLink}
          href="/"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="sm"
        >
          Back
        </Button>
        <IconButton
          icon={colorMode === "dark" ? <FiSun /> : <FiMoon />}
          onClick={() => toggleColorMode()}
          variant="ghost"
          size="sm"
          aria-label="Toggle theme"
        />
      </Flex>

      <Flex justifyContent={"center"} alignItems={"center"} minH="100vh" py={8}>
        <Tabs
          variant="soft-rounded"
          colorScheme="teal"
          index={tabIndex}
          onChange={handleTabsChange}
        >
          <TabList justifyContent="center" mb={4}>
            <Tab>Sign In</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp onRegisterSuccess={() => setTabIndex(0)} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Box>
  );
}
