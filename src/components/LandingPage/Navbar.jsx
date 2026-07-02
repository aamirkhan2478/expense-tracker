"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  IconButton,
  Avatar,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import NextLink from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const storedUser =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      setIsLoggedIn(!!token);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const navItems = getNavItems(isLoggedIn);

  return (
    <Box position="fixed" w="100%" zIndex={999} top={0}>
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4, md: 8 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align={"center"}
        boxShadow="sm"
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <Icon as={FiX} /> : <Icon as={FiMenu} />}
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }} align="center">
          <Text
            textAlign={useBreakpointValue({ base: "center", md: "left" })}
            fontFamily={"heading"}
            color={useColorModeValue("teal.600", "white")}
            fontWeight="bold"
            fontSize="xl"
            as={NextLink}
            href="/"
            _hover={{ textDecoration: "none" }}
          >
            SpendWise
          </Text>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav items={navItems} />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={4}
          align="center"
        >
          {isLoggedIn ? (
            <>
              <Button
                as={NextLink}
                display={{ base: "none", md: "inline-flex" }}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"teal.500"}
                href={"/dashboard"}
                _hover={{
                  bg: "teal.400",
                }}
                borderRadius="xl"
              >
                Dashboard
              </Button>
              <Avatar
                size="sm"
                name={user?.name || "User"}
                bg="teal.500"
                color="white"
                display={{ base: "none", md: "flex" }}
              />
            </>
          ) : (
            <>
              <Button
                as={NextLink}
                fontSize={"sm"}
                fontWeight={400}
                variant={"link"}
                href={"/auth"}
                display={{ base: "none", md: "inline-flex" }}
              >
                Sign In
              </Button>
              <Button
                as={NextLink}
                display={{ base: "none", md: "inline-flex" }}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"teal.500"}
                href={"/auth?tab=signup"}
                _hover={{
                  bg: "teal.400",
                }}
                borderRadius="xl"
              >
                Get Started
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav items={navItems} isLoggedIn={isLoggedIn} user={user} />
      </Collapse>
    </Box>
  );
}

const DesktopNav = ({ items }) => {
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");
  const popoverContentBgColor = useColorModeValue("white", "gray.800");

  return (
    <Stack direction={"row"} spacing={4}>
      {items.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} placement={"bottom-start"}>
            <PopoverTrigger>
              <Link
                as={navItem.href ? NextLink : "span"}
                href={navItem.href ?? "#"}
                p={2}
                fontSize={"sm"}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: "none",
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={"xl"}
                bg={popoverContentBgColor}
                p={4}
                rounded={"xl"}
                minW={"sm"}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      as={NextLink}
      href={href}
      role={"group"}
      display={"block"}
      p={2}
      rounded={"md"}
      _hover={{ bg: useColorModeValue("teal.50", "gray.900") }}
    >
      <Stack direction={"row"} align={"center"}>
        <Box>
          <Text
            transition={"all .3s ease"}
            _groupHover={{ color: "teal.500" }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={"sm"}>{subLabel}</Text>
        </Box>
        <Flex
          transition={"all .3s ease"}
          transform={"translateX(-10px)"}
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          justify={"flex-end"}
          align={"center"}
          flex={1}
        >
          <Icon color={"teal.500"} w={5} h={5} as={FiChevronRight} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = ({ items, isLoggedIn, user }) => {
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
      boxShadow="md"
    >
      {items.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
      <Stack spacing={4} mt={4} pt={4} borderTopWidth={1}>
        {isLoggedIn ? (
          <>
            <Button
              as={NextLink}
              href="/dashboard"
              bg="teal.500"
              color="white"
              _hover={{ bg: "teal.400" }}
              borderRadius="xl"
            >
              Dashboard
            </Button>
            <Flex align="center" gap={3} px={2}>
              <Avatar size="sm" name={user?.name || "User"} bg="teal.500" color="white" />
              <Text fontSize="sm" fontWeight="medium">
                {user?.name || "User"}
              </Text>
            </Flex>
          </>
        ) : (
          <>
            <Button as={NextLink} href="/auth" variant="link" justifyContent="start">
              Sign In
            </Button>
            <Button
              as={NextLink}
              href="/auth?tab=signup"
              bg="teal.500"
              color="white"
              _hover={{ bg: "teal.400" }}
              borderRadius="xl"
            >
              Get Started
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={href ? NextLink : "span"}
        href={href ?? "#"}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue("gray.600", "gray.200")}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={FiChevronDown}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        >
          {children &&
            children.map((child) => (
              <Link as={NextLink} key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

function getNavItems(isLoggedIn) {
  const items = [
    {
      label: "Features",
      href: "#features",
    },
    {
      label: "How It Works",
      href: "#how-it-works",
    },
  ];

  if (isLoggedIn) {
    items.push({
      label: "Dashboard",
      href: "/dashboard",
    });
  }

  return items;
}
