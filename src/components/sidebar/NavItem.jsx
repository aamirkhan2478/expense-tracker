"use client";

import { Box, Flex, Icon } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavItem = ({
  icon,
  children,
  path,
  onClick,
  background,
  isBackground,
  ...rest
}) => {
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <Link
      href={path ? path : "#"}
      style={{ textDecoration: "none" }}
      onClick={onClick || undefined}
    >
      <Flex
        align="center"
        p="3"
        mx="4"
        my="1"
        borderRadius="xl"
        role="group"
        cursor="pointer"
        transition="all 0.2s ease"
        bg={isActive ? "teal.500" : isBackground ? background : "transparent"}
        color={isActive || isBackground ? "white" : undefined}
        boxShadow={isActive ? "md" : "none"}
        _hover={{
          bg: isBackground ? "red.400" : "teal.50",
          color: isBackground ? "white" : "teal.600",
          transform: "translateX(4px)",
        }}
        {...rest}
      >
        {icon && (
          <Flex
            w={8}
            h={8}
            align="center"
            justify="center"
            borderRadius="lg"
            mr={3}
            bg={isActive ? "whiteAlpha.200" : isBackground ? "whiteAlpha.200" : "gray.100"}
            color={isActive || isBackground ? "white" : "gray.500"}
            _groupHover={{
              bg: isBackground ? "whiteAlpha.300" : "teal.100",
              color: isBackground ? "white" : "teal.600",
            }}
            transition="all 0.2s ease"
          >
            <Icon fontSize="14" as={icon} />
          </Flex>
        )}
        <Box fontSize="sm" fontWeight="medium">
          {children}
        </Box>
      </Flex>
    </Link>
  );
};

export default NavItem;
