"use client";

import {
  Box,
  Flex,
  CloseButton,
  Text,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";
import NavItem from "./NavItem";
import { FiCompass, FiHome, FiMoon, FiSun, FiTrendingUp } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { signOut } from "next-auth/react";
const SidebarContent = ({ onClose, ...rest }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const LinkItems = [
    { name: "Home", icon: FiHome, path: "/dashboard" },
    { name: "Expense", icon: FiTrendingUp, path: "/expense" },
    { name: "Income", icon: FiCompass, path: "/income" },
    {
      name: colorMode === "dark" ? "Light Mode" : "Dark Mode",
      icon: colorMode === "dark" ? FiSun : FiMoon,
      onClick: () => toggleColorMode(),
    },
    {
      name: "Logout",
      icon: MdLogout,
      onClick: () => signOut(),
    },
  ];
  return (
    <Box
      bg={useColorModeValue("#F7EEF1", "dark")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="lg" fontFamily="monospace" fontWeight="bold">
          Expense Tracker
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem
          key={link.name}
          icon={link.icon}
          path={link.path}
          onClick={link.onClick}
        >
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

export default SidebarContent;
