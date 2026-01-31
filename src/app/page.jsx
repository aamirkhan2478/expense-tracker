"use client";
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
import { useState } from "react";

export default function SignIn() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  return (
    <>
      <Flex justifyContent={"center"} alignItems={"center"} mt={"20px"}>
        <Tabs
          variant="soft-rounded"
          colorScheme="green"
          index={tabIndex}
          onChange={handleTabsChange}
        >
          <TabList>
            <Tab>Sign In</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp onRegisterSuccess={() => setTabIndex(0)} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </>
  );
}
