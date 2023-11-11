"use client";

import { useRef } from "react";

const {
  Button,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialog,
} = require("@chakra-ui/react");

const Alert = ({
  isOpen,
  onClose,
  alertHeader,
  alertBody,
  onClick,
  confirmButtonText,
  isLoading,
  ...rest
}) => {
  const cancelRef = useRef();

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {alertHeader}
            </AlertDialogHeader>

            <AlertDialogBody>{alertBody}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClick} ml={3} {...rest} isLoading={isLoading}>
                {confirmButtonText}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Alert;
