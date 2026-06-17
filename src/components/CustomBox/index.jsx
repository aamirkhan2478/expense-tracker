"use client";

import { Box, useColorModeValue } from "@chakra-ui/react";

const CustomBox = ({ children }) => {
  return (
    <Box
      minH={{ base: "full", md: "calc(100vh - 48px)" }}
      bg={useColorModeValue("white", "gray.900")}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={useColorModeValue("gray.100", "gray.800")}
      shadow="sm"
      p={{ base: 4, md: 8 }}
    >
      {children}
    </Box>
  );
};

export default CustomBox;
