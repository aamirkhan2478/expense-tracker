import React, { useState } from 'react';
import { Flex, Button, Text, Box } from '@chakra-ui/react';

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(currentPage - 1);

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      onPageChange(currentPageIndex);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      onPageChange(currentPageIndex + 2);
    }
  };

  return (
    <Flex
      direction="row"
      justifyContent="center"
      alignItems="center"
      marginBottom={10}
      backgroundColor="white"
      borderRadius="20px"
    >
      <Button
        variant="outline"
        padding="5px"
        onClick={goToPreviousPage}
        isDisabled={currentPageIndex === 0}
      >
        {'<'}
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
        {'>'}
      </Button>
    </Flex>
  );
};

export default Pagination;
