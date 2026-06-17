"use client";
import { useState, useEffect } from "react";
import { Flex, Button, Text, useColorModeValue } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

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

  const activeBg = useColorModeValue("teal.500", "teal.400");
  const activeColor = "white";
  const inactiveBg = useColorModeValue("gray.100", "gray.700");
  const inactiveColor = useColorModeValue("gray.600", "gray.300");

  if (totalPages <= 1) return null;

  return (
    <Flex
      direction="row"
      justifyContent="center"
      alignItems="center"
      gap={2}
      py={4}
      {...rest}
    >
      <Button
        variant="ghost"
        size="sm"
        borderRadius="full"
        onClick={goToPreviousPage}
        isDisabled={currentPageIndex === 0}
        leftIcon={<FiChevronLeft />}
      >
        Prev
      </Button>

      <Flex
        align="center"
        justify="center"
        w={10}
        h={10}
        borderRadius="xl"
        bg={activeBg}
        color={activeColor}
        fontWeight="bold"
        fontSize="sm"
        boxShadow="md"
      >
        {currentPage}
      </Flex>

      <Text fontSize="sm" color={inactiveColor} fontWeight="medium">
        of {totalPages}
      </Text>

      <Button
        variant="ghost"
        size="sm"
        borderRadius="full"
        onClick={goToNextPage}
        isDisabled={currentPageIndex === totalPages - 1}
        rightIcon={<FiChevronRight />}
      >
        Next
      </Button>
    </Flex>
  );
};

export default Pagination;
