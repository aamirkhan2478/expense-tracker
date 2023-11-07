import { Box, Flex, Icon } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavItem = ({ icon, children, path, onClick, ...rest }) => {
  const pathname = usePathname();
  return (
    <Link
      as={Box}
      href={path ? path : ""}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
      onClick={onClick || undefined}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        my='1'
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={pathname === path ? "cyan.400" : ""}
        color={pathname === path ? "white" : ""}
        _hover={{
          bg: "cyan.400",
          color: "white",
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: "white",
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

export default NavItem;
