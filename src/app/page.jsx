import SignUp from "@/components/Authentication/SignUp";
import Login from "@/components/Authentication/SignIn";
import {
  Flex,
  Text,
  FormControl,
  FormLabel,
  Heading,
  Box,
  // useColorModeValue,
  InputRightElement,
  IconButton,
  useColorMode,
  Button,
  Stack,
  Input,
  InputGroup,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
import { FiSun, FiMoon, FiEye, FiEyeOff } from "react-icons/fi";
export default function SignIn() {
  // const router = useRouter();
  // const [show, setShow] = useState(false);
  // const handleClick = () => setShow(!show);

  return (
    <>
      {/* <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading fontSize={"4xl"}>Sign in to your account</Heading>
            <Text fontSize={"lg"} color={"gray.600"}>
              to enjoy all of our cool <Text color={"blue.400"}>features</Text>
            </Text>
          </Stack>
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
                >
                  Sign in
                </Button>
                <IconButton
                  icon={colorMode === "dark" ? <FiSun /> : <FiMoon />}
                  onClick={() => toggleColorMode()}
                />
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Flex> */}
      <Flex justifyContent={"center"} alignItems={"center"} mt={"20px"}>
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList>
            <Tab>Sign In</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </>
  );
}
