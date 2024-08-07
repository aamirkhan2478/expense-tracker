"use client";
import { useState, useEffect } from "react";
import { Flex, Button, Text, useColorModeValue } from "@chakra-ui/react";

const Pagination = ({ totalPages, currentPage, onPageChange, ...rest }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(currentPage - 1);

  useEffect(() => {
    setCurrentPageIndex(currentPage - 1);
  }, [currentPage]);

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      const newPageIndex = currentPageIndex - 1;
      setCurrentPageIndex(newPageIndex);
      onPageChange(newPageIndex + 1);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      const newPageIndex = currentPageIndex + 1;
      setCurrentPageIndex(newPageIndex);
      onPageChange(newPageIndex + 1);
    }
  };

  return (
    <Flex
      direction="row"
      justifyContent="center"
      alignItems="center"
      marginBottom={10}
      backgroundColor={useColorModeValue("white", "gray")}
      borderRadius="10px"
      paddingX={5}
      boxShadow="lg"
      width="98%"
      maxWidth="3xl"
      {...rest}
    >
      <Button
        variant="outline"
        padding="5px"
        onClick={goToPreviousPage}
        isDisabled={currentPageIndex === 0}
      >
        {"<"}
      </Button>
      <Text fontSize="20px" marginX="10px">
        Page {currentPage} of {totalPages}
      </Text>
      <Button
        variant="outline"
        padding="5px"
        onClick={goToNextPage}
        isDisabled={currentPageIndex === totalPages - 1}
      >
        {">"}
      </Button>
    </Flex>
  );
};

export default Pagination;
