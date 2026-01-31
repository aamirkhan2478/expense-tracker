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
import { useSignInUser } from "@/hooks/useAuth";
const SignIn = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const {
    mutate,
    isLoading: loading,
    isSuccess,
  } = useSignInUser(onSuccess, onError);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
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
    mutate(user);
  };

  function onSuccess(data) {
    // store token in localStorage
    localStorage.setItem("token", data?.data?.token);

    // store user in localStorage
    localStorage.setItem("user", JSON.stringify(data?.data?.user));

    // Store token in cookie for middleware access
    document.cookie = `token=${data?.data?.token}; path=/; max-age=86400; SameSite=Strict`;

    toast({
      title: data?.data?.msg,
      status: "success",
      isClosable: true,
    });
  }

  function onError(error) {
    // remove token and user from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // remove token from cookie
    document.cookie = "token=; path=/; max-age=0; SameSite=Strict";

    toast({
      title: error.response.data.error,
      status: "error",
      isClosable: true,
    });
  }

  useEffect(() => {
    if (isSuccess) {
      router.push("/dashboard");
    }
  }, [isSuccess, router]);

  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        shadow={"dark-lg"}
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
