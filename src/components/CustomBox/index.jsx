"use client";

import { Box, useColorModeValue } from "@chakra-ui/react";

const CustomBox = ({ children }) => {
  return (
    <>
      <Box
        minH={{ base: "full", md: "100vh" }}
        bg={useColorModeValue("#F7EEF1", "dark")}
        borderRadius={"10px"}
        borderWidth={'1px'}
        shadow={"lg"}
      >
        {children}
      </Box>
    </>
  );
};

export default CustomBox;
