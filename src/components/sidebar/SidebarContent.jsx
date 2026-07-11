"use client";

import {
  Box,
  Flex,
  CloseButton,
  Text,
  useColorModeValue,
  useColorMode,
  useDisclosure,
  Avatar,
  Stack,
  Divider,
} from "@chakra-ui/react";
import NavItem from "./NavItem";
import {
  FiActivity,
  FiHome,
  FiMoon,
  FiSun,
  FiTrendingUp,
  FiPieChart,
  FiLogOut,
  FiSettings,
  FiGlobe,
  FiBarChart2,
} from "react-icons/fi";
import Alert from "../Alert";
import GlobalSearch from "../GlobalSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const SidebarContent = ({ onClose, ...rest }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { onClose: closeAlert, isOpen, onOpen } = useDisclosure();
  const router = useRouter();
  const { logout, user } = useAuth();

  const confirmHandler = () => {
    closeAlert();
    logout({ sessionExpired: false });
  };

  const LinkItems = [
    { name: "Home", icon: FiGlobe, path: "/" },
    { name: "Dashboard", icon: FiHome, path: "/dashboard" },
    { name: "Income", icon: FiTrendingUp, path: "/income" },
    { name: "Expense", icon: FiPieChart, path: "/expense" },
    { name: "Category", icon: FiActivity, path: "/category" },
    { name: "Reports", icon: FiBarChart2, path: "/reports" },
    { name: "Settings", icon: FiSettings, path: "/settings" },
  ];

  const bottomItems = [
    {
      name: colorMode === "dark" ? "Light Mode" : "Dark Mode",
      icon: colorMode === "dark" ? FiSun : FiMoon,
      onClick: () => toggleColorMode(),
    },
    {
      name: "Logout",
      icon: FiLogOut,
      onClick: () => onOpen(),
      background: "red.500",
      isBackground: true,
    },
  ];

  return (
    <>
      <Alert
        alertBody={"Are you sure you want to logout?"}
        alertHeader={"Logout"}
        confirmButtonText={"Logout"}
        isOpen={isOpen}
        onClick={confirmHandler}
        onClose={closeAlert}
        colorScheme={"red"}
      />
      <Box
        bg={useColorModeValue("white", "gray.900")}
        borderRight="1px"
        borderRightColor={useColorModeValue("gray.100", "gray.800")}
        w={{ base: "full", md: 64 }}
        pos="fixed"
        h="full"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        {...rest}
      >
        {/* Header */}
        <Flex h="20" alignItems="center" mx="6" justifyContent="space-between">
          <Flex align="center" gap={2} my={3}>
            <Box
              w={8}
              h={8}
              borderRadius="lg"
              bg="teal.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiPieChart color="white" size={18} />
            </Box>
            <Text fontSize="lg" fontWeight="bold" letterSpacing="tight">
              SpendWise
            </Text>
          </Flex>
          <CloseButton
            display={{ base: "flex", md: "none" }}
            onClick={onClose}
          />
        </Flex>

        {/* User Profile */}
        <Box px={6} pb={4}>
          <Flex
            align="center"
            gap={3}
            p={3}
            borderRadius="xl"
            bg={useColorModeValue("gray.50", "gray.800")}
            border="1px solid"
            borderColor={useColorModeValue("gray.100", "gray.700")}
          >
            <Avatar
              size="sm"
              name={user?.name || "User"}
              bg="teal.500"
              color="white"
            />
            <Stack spacing={0} overflow="hidden">
              <Text fontSize="sm" fontWeight="semibold" isTruncated>
                {user?.name || "User"}
              </Text>
              <Text fontSize="xs" color="gray.500" isTruncated>
                {user?.email || ""}
              </Text>
            </Stack>
          </Flex>
        </Box>

        <Box px={6} pb={3} display={{ base: "block", md: "none" }}>
          <GlobalSearch />
        </Box>

        <Box px={6} pb={3} display={{ base: "none", md: "block" }}>
          <GlobalSearch />
        </Box>

        <Divider
          mx={6}
          w="auto"
          borderColor={useColorModeValue("gray.100", "gray.700")}
        />

        {/* Main Nav */}
        <Box
          flex={1}
          py={4}
          overflowY="auto"
          sx={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <Text
            px={8}
            pb={2}
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wider"
            color="gray.400"
          >
            Menu
          </Text>
          {LinkItems.map((link) => (
            <NavItem key={link.name} icon={link.icon} path={link.path}>
              {link.name}
            </NavItem>
          ))}
        </Box>

        {/* Bottom Actions */}
        <Box pb={6}>
          <Divider
            mx={6}
            w="auto"
            mb={4}
            borderColor={useColorModeValue("gray.100", "gray.700")}
          />
          {bottomItems.map((link) => (
            <NavItem
              key={link.name}
              icon={link.icon}
              path={link.path}
              onClick={link.onClick}
              background={link.background}
              isBackground={link.isBackground}
            >
              {link.name}
            </NavItem>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default SidebarContent;
