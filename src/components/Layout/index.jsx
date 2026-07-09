"use client";

import {
  Box,
  Drawer,
  DrawerContent,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import SidebarContent from "../sidebar/SidebarContent";
import Navbar from "../sidebar/Navbar";
import { useTokenExpiryCheck } from "@/hooks/useTokenExpiryCheck";

const Layout = ({ children }) => {
  useTokenExpiryCheck();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.950")}>
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", md: "flex" }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="xs"
      >
        <DrawerContent bg={useColorModeValue("white", "gray.900")}>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <Navbar display={{ base: "flex", md: "none" }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 64 }} p={{ base: 3, md: 6 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
