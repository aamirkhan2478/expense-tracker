"use client";

import {
  Flex,
  IconButton,
  Text,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import { FiMenu, FiPieChart } from "react-icons/fi";

const Navbar = ({ onOpen, ...rest }) => {
  return (
    <Flex
      ml={{ base: 0, md: 64 }}
      px={{ base: 4, md: 6 }}
      height="16"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.100", "gray.800")}
      justifyContent="flex-start"
      {...rest}
    >
      <Flex align="center">
        <IconButton
          variant="ghost"
          onClick={onOpen}
          aria-label="open menu"
          icon={<FiMenu />}
          mr={4}
        />

        <Flex align="center" gap={2}>
          <Box
            w={7}
            h={7}
            borderRadius="md"
            bg="teal.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiPieChart color="white" size={16} />
          </Box>
          <Text fontSize="md" fontWeight="bold" letterSpacing="tight">
            SpendWise
          </Text>
        </Flex>
      </Flex>

    </Flex>
  );
};

export default Navbar;
