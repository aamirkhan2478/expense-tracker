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
  useToast,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { FiEye, FiEyeOff, FiMoon, FiSun } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
const SignIn = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUser((preData) => {
      return {
        ...preData,
        [name]: value,
      };
    });
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await signIn("credentials", {
        ...user,
        redirect: false,
      });

      const { error } = response;
      if (error === "CredentialsSignin") {
        toast({
          title: "Invalid Credentials",
          status: "error",
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Invalid Credentials",
        status: "error",
        isClosable: true,
      });
      console.log(`Error occurred during sign-in: ${error}`);
      toast({
        title: `Error occurred during sign-in: ${error}`,
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);
  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        shadow={'dark-lg'}
        p={8}
      >
        <Stack spacing={4}>
          <FormControl id="email">
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              onChange={changeHandler}
              value={user.email}
              name="email"
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={show ? "text" : "password"}
                onChange={changeHandler}
                value={user.password}
                name="password"
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    submitHandler(e);
                  }
                }}
              />
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
              onClick={submitHandler}
              isLoading={loading}
              
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
