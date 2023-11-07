"use client";

import { Flex, IconButton, Text, useColorModeValue } from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";

const Navbar = ({ onOpen, ...rest }) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text fontSize="gl" ml="8" fontFamily="monospace" fontWeight="bold">
        Expense Tracker
      </Text>
    </Flex>
  );
};

export default Navbar;
