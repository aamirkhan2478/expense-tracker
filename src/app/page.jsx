import SignUp from "@/components/Authentication/SignUp";
import Login from "@/components/Authentication/SignIn";
import {
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
export default function SignIn() {
  return (
    <>
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
