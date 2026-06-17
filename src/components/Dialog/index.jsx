"use client";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
} from "@chakra-ui/react";

function Dialog({ isOpen, onClose, title, body }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        bg={useColorModeValue("white", "gray.800")}
        borderRadius="2xl"
        boxShadow="xl"
        mx={4}
      >
        <ModalHeader fontSize="lg" fontWeight="bold" pt={6} px={6}>
          {title}
        </ModalHeader>
        <ModalCloseButton top={6} right={6} borderRadius="full" />
        <ModalBody pb={6} px={6}>
          {body}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default Dialog;
