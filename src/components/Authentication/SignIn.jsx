"use client";
import {
  Box,
  useColorModeValue,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import { FiEye, FiEyeOff, FiMoon, FiSun } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";
const SignIn = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <Stack spacing={4}>
          <FormControl id="email">
            <FormLabel>Email address</FormLabel>
            <Input type="email" />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input type={show ? "text" : "password"} />
              <InputRightElement
                width="4.5rem"
                height="2.3rem"
                onClick={handleClick}
                cursor={"pointer"}
              >
                {show ? <FiEyeOff /> : <FiEye />}
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Stack spacing={10}>
            <Stack
              direction={{ base: "column", sm: "row" }}
              align={"start"}
              justify={"space-between"}
            >
              <Text color={"blue.400"}>Forgot password?</Text>
            </Stack>
            <Button
              bg={"blue.400"}
              color={"white"}
              _hover={{
                bg: "blue.500",
              }}
              onClick={() => router.push("/dashboard")}
            >
              Sign In
            </Button>
            <IconButton
              icon={colorMode === "dark" ? <FiSun /> : <FiMoon />}
              onClick={() => toggleColorMode()}
            />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default SignIn;
